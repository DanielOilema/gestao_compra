import { Capacitor } from "@capacitor/core";

/**
 * Gravação de arquivo exportado, unificando navegador e app nativo.
 *
 * No navegador é um download comum. No app Capacitor não existe download: o arquivo precisa ser
 * escrito no sistema de arquivos e entregue ao usuário pelo share sheet, senão a exportação
 * simplesmente não produz nada visível.
 *
 * Os produtores são preguiçosos para que apenas o formato necessário à plataforma seja gerado —
 * o PDF, por exemplo, sai direto em base64 no nativo, sem passar por Blob.
 */
export interface SaveFileInput {
  /** Nome do arquivo com extensão. */
  fileName: string;
  mimeType: string;
  toBlob: () => Promise<Blob>;
  /** Usado no app nativo. Ausente, o Blob é convertido. */
  toBase64?: () => Promise<string>;
}

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

export const sanitizeFileName = (name: string): string =>
  name
    .replace(INVALID_FILENAME_CHARS, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "relatorio";

/** Sufixo de data/hora local, para não sobrescrever exportações anteriores. */
export const fileNameTimestamp = (date = new Date()): string => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join("");
};

export const buildExportFileName = (base: string, extension: string): string =>
  `${sanitizeFileName(base)}-${fileNameTimestamp()}.${extension}`;

const stripDataUrlPrefix = (value: string): string => {
  const comma = value.indexOf(",");
  return comma >= 0 ? value.slice(comma + 1) : value;
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível preparar o arquivo."));
    reader.onload = () => resolve(stripDataUrlPrefix(String(reader.result)));
    reader.readAsDataURL(blob);
  });

const saveInBrowser = async (input: SaveFileInput): Promise<void> => {
  const blob = await input.toBlob();
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = input.fileName;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    // Revogar imediatamente aborta o download em alguns navegadores.
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
};

/** O usuário fechar o share sheet não é falha de exportação. */
const isShareDismissal = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /cancel|abort|dismiss/i.test(message);
};

const saveInNativeApp = async (input: SaveFileInput): Promise<void> => {
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import("@capacitor/filesystem"),
    import("@capacitor/share"),
  ]);

  const data = input.toBase64
    ? await input.toBase64()
    : await blobToBase64(await input.toBlob());

  const { uri } = await Filesystem.writeFile({
    path: input.fileName,
    data,
    directory: Directory.Cache,
  });

  try {
    await Share.share({
      title: input.fileName,
      url: uri,
      dialogTitle: "Compartilhar arquivo",
    });
  } catch (error) {
    if (isShareDismissal(error)) return;
    throw new Error(
      `O arquivo foi gerado, mas não foi possível abrir o compartilhamento. Caminho: ${uri}`,
    );
  }
};

export async function saveFile(input: SaveFileInput): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await saveInNativeApp(input);
    return;
  }

  await saveInBrowser(input);
}
