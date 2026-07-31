import type { DebitCreditNote } from "@gestao-compra/shared";
import { getDetNotaDebCre } from "@/hooks/getDetNotaDebCre";
import logoOilemaImpressao from "@/assets/logooilema-impressao.png";
import { buildNotaPrintHtml } from "./buildNotaPrintHtml";

export interface PrintNotaDebCreParams {
  nota: DebitCreditNote;
  accessToken: string;
}

export interface NotaPrintSession {
  finish: (html: string) => Promise<void>;
  abort: () => void;
}

const createPrintFrame = (): HTMLIFrameElement => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);
  return iframe;
};

const writeFrameHtml = (iframe: HTMLIFrameElement, html: string) => {
  const frameDocument = iframe.contentWindow?.document;
  if (!frameDocument) {
    throw new Error("Não foi possível preparar a impressão.");
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();
};

const printFrame = (iframe: HTMLIFrameElement): Promise<void> =>
  new Promise((resolve, reject) => {
    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      reject(new Error("Não foi possível preparar a impressão."));
      return;
    }

    const cleanup = () => {
      window.setTimeout(() => iframe.remove(), 500);
      resolve();
    };

    frameWindow.addEventListener("afterprint", cleanup, { once: true });

    const triggerPrint = () => {
      try {
        frameWindow.focus();
        frameWindow.print();
      } catch (err) {
        iframe.remove();
        reject(err instanceof Error ? err : new Error("Erro ao imprimir nota"));
        return;
      }

      window.setTimeout(() => {
        if (document.body.contains(iframe)) {
          cleanup();
        }
      }, 2000);
    };

    const frameDocument = frameWindow.document;
    if (frameDocument.readyState === "complete") {
      window.setTimeout(triggerPrint, 150);
      return;
    }

    iframe.addEventListener("load", () => window.setTimeout(triggerPrint, 150), { once: true });
  });

/** Deve ser chamado de forma síncrona no clique do usuário (antes de qualquer await). */
export const startNotaPrintSession = (): NotaPrintSession => {
  const iframe = createPrintFrame();

  writeFrameHtml(
    iframe,
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8" /><title>Preparando impressão</title></head><body><p>Preparando impressão...</p></body></html>`,
  );

  return {
    finish: async (html: string) => {
      writeFrameHtml(iframe, html);
      await printFrame(iframe);
    },
    abort: () => {
      iframe.remove();
    },
  };
};

export async function printNotaDebCre({
  nota,
  accessToken,
  session,
}: PrintNotaDebCreParams & { session?: NotaPrintSession }): Promise<void> {
  const printSession = session ?? startNotaPrintSession();

  try {
    const full = await getDetNotaDebCre({
      filial: nota.filial,
      tipo: nota.tipo,
      codigo: nota.numero,
      accessToken,
      header: nota,
    });

    await printSession.finish(
      buildNotaPrintHtml(full, {
        logoUrl: new URL(logoOilemaImpressao, window.location.origin).href,
      }),
    );
  } catch (err) {
    printSession.abort();
    throw err;
  }
}
