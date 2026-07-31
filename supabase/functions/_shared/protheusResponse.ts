const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
const cp1252Decoder = new TextDecoder('windows-1252');

/**
 * Lê o corpo de uma resposta do Protheus com o encoding correto.
 * O AppServer usa CP1252 internamente; quando o REST não converte para UTF-8,
 * bytes como 0xE7 (ç) são interpretados como UTF-8 inválido e viram "".
 */
export async function readProtheusText(response: Response): Promise<string> {
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const charset = (response.headers.get('content-type') ?? '')
    .toLowerCase()
    .match(/charset=([\w-]+)/)?.[1];

  if (charset === 'windows-1252' || charset === 'cp1252') {
    return cp1252Decoder.decode(bytes);
  }
  if (charset === 'utf-8') {
    return utf8Decoder.decode(bytes);
  }

  const utf8Text = utf8Decoder.decode(bytes);
  if (!utf8Text.includes('\uFFFD')) {
    return utf8Text;
  }

  return cp1252Decoder.decode(bytes);
}

export async function parseProtheusJson(response: Response): Promise<unknown> {
  const text = await readProtheusText(response);
  if (!text.trim()) return null;
  return JSON.parse(text);
}
