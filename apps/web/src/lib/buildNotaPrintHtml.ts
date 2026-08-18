import type { DebitCreditNote } from "@gestao-compra/shared";
import {
  formatNotaParteLines,
  formatNotaPrintCurrency,
  formatNotaPrintDate,
  getNotaPrintFormaPagamento,
  getNotaPrintItemCentroCusto,
  getNotaPrintItemDescription,
  getNotaPrintNumeroDoc,
  getNotaPrintNumeroLabel,
  getNotaPrintResponsavel,
  getNotaPrintTitle,
  getNotaPrintTotal,
  getNotaRecebedorParte,
  getNotaTomadorParte,
} from "@gestao-compra/shared";

export interface NotaPrintHtmlOptions {
  logoUrl?: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderPartyBlock = (lines: string[]): string => {
  if (lines.length === 0 || (lines.length === 1 && lines[0] === "-")) {
    return `<div class="party-line">-</div>`;
  }

  return lines
    .map((line, index) => {
      const className = index === 0 ? "party-line party-name" : "party-line";
      return `<div class="${className}">${escapeHtml(line)}</div>`;
    })
    .join("");
};

const renderItems = (nota: DebitCreditNote): string => {
  const showCentroCusto = nota.tipo === "debito";
  const rows = nota.itens.length
    ? nota.itens
    : [
        {
          id: "total",
          produto: "",
          descricao: "-",
          valor: nota.valorTotal,
        },
      ];

  return rows
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(getNotaPrintItemDescription(item))}</td>
          ${
            showCentroCusto
              ? `<td class="centro-custo">${escapeHtml(getNotaPrintItemCentroCusto(item))}</td>`
              : ""
          }
          <td class="value">${escapeHtml(formatNotaPrintCurrency(item.valor))}</td>
        </tr>
      `,
    )
    .join("");
};

export const buildNotaPrintHtml = (
  nota: DebitCreditNote,
  options: NotaPrintHtmlOptions = {},
): string => {
  const title = getNotaPrintTitle(nota.tipo);
  const numeroLabel = getNotaPrintNumeroLabel(nota.tipo);
  const recebedorLines = formatNotaParteLines(getNotaRecebedorParte(nota));
  const tomadorLines = formatNotaParteLines(getNotaTomadorParte(nota));
  const total = getNotaPrintTotal(nota);
  const numeroDoc = getNotaPrintNumeroDoc(nota);
  const isDebito = nota.tipo === "debito";
  const logoUrl = options.logoUrl?.trim() ?? "";

  const logoMarkup = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="Oilema" class="logo" />`
    : `<div class="logo-placeholder">Oilema</div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} ${escapeHtml(nota.numero)}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 16mm 14mm 14mm;
      }

      * {
        box-sizing: border-box;
      }

      html, body {
        margin: 0;
        padding: 0;
      }

      body {
        color: #2f3438;
        font-family: Arial, Helvetica, "Segoe UI", sans-serif;
        font-size: 10pt;
        line-height: 1.35;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .page {
        width: 100%;
        max-width: 182mm;
        margin: 0 auto;
      }

      .brand-header {
        margin-bottom: 10mm;
      }

      .logo {
        display: block;
        width: 48mm;
        max-width: 100%;
        height: auto;
      }

      .logo-placeholder {
        font-size: 18pt;
        font-weight: 700;
        color: #4a555c;
      }

      .doc-title {
        margin: 0 0 4mm;
        text-align: center;
        font-size: 15pt;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: #1f2428;
      }

      .doc-title-rule {
        width: 52mm;
        height: 2px;
        margin: 0 auto 8mm;
        background: linear-gradient(90deg, #f38521 0%, #f38521 62%, #4a555c 62%, #4a555c 100%);
      }

      .meta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8mm;
        margin-bottom: 7mm;
      }

      .meta-block {
        min-height: 18mm;
      }

      .meta-block.right {
        text-align: right;
      }

      .meta-label {
        font-size: 9.5pt;
        font-weight: 700;
        color: #1f2428;
        margin-bottom: 1.5mm;
      }

      .meta-value {
        font-size: 11pt;
        font-weight: 700;
        color: #1f2428;
      }

      .meta-sub {
        margin-top: 3mm;
        font-size: 10pt;
        color: #2f3438;
      }

      .section {
        margin-bottom: 6mm;
      }

      .section-title {
        font-size: 10pt;
        font-weight: 700;
        color: #1f2428;
        margin-bottom: 2mm;
      }

      .section-title.uppercase {
        letter-spacing: 0.03em;
      }

      .party-line {
        font-size: 9.5pt;
        color: #2f3438;
      }

      .party-name {
        font-size: 10.5pt;
        font-weight: 700;
        margin-bottom: 0.5mm;
      }

      .referente-text {
        font-size: 10pt;
        color: #2f3438;
        white-space: pre-wrap;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 2mm;
      }

      th, td {
        border: 1px solid #1f2428;
        padding: 2.5mm 3mm;
        vertical-align: top;
      }

      th {
        font-size: 9.5pt;
        font-weight: 700;
        text-align: left;
        background: #f4f5f6;
      }

      td {
        font-size: 9.5pt;
      }

      td.value, th.value {
        width: 34mm;
        text-align: right;
        white-space: nowrap;
      }

      td.centro-custo, th.centro-custo {
        width: 38mm;
      }

      .total-row td {
        font-size: 10pt;
        font-weight: 700;
        background: #fafafa;
      }

      .footer-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10mm;
        margin-top: 8mm;
      }

      .footer-label {
        font-size: 9.5pt;
        font-weight: 700;
        color: #1f2428;
        margin-bottom: 1.5mm;
      }

      .footer-value {
        font-size: 10pt;
        color: #2f3438;
      }

      .numero-doc {
        margin-top: 8mm;
      }

      @media print {
        body {
          font-size: 10pt;
        }

        .page {
          max-width: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="brand-header">
        ${logoMarkup}
      </header>

      <h1 class="doc-title">${escapeHtml(title)}</h1>
      <div class="doc-title-rule"></div>

      <div class="meta-grid">
        <div class="meta-block">
          <div class="meta-label">Data de Emissão</div>
          <div class="meta-value">${escapeHtml(formatNotaPrintDate(nota.dataEmissao))}</div>
          <div class="meta-sub">Vencimento: ${escapeHtml(formatNotaPrintDate(nota.dataVencimento))}</div>
        </div>
        <div class="meta-block right">
          <div class="meta-label">${escapeHtml(numeroLabel)}</div>
          <div class="meta-value">${escapeHtml(nota.numero || "-")}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Recebedor</div>
        ${renderPartyBlock(recebedorLines)}
      </div>

      <div class="section">
        <div class="section-title uppercase">Tomador/Pagador:</div>
        ${renderPartyBlock(tomadorLines)}
      </div>

      <div class="section">
        <div class="section-title">Referente a:</div>
        <div class="referente-text">${escapeHtml(nota.referenteA?.trim() || "-")}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Descrição do Item (Observação)</th>
            ${isDebito ? `<th class="centro-custo">Centro de Custo</th>` : ""}
            <th class="value">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          ${renderItems(nota)}
          <tr class="total-row">
            <td>TOTAL</td>
            ${isDebito ? "<td></td>" : ""}
            <td class="value">${escapeHtml(formatNotaPrintCurrency(total))}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer-grid">
        <div>
          <div class="footer-label">Forma de Pagamento</div>
          <div class="footer-value">${escapeHtml(getNotaPrintFormaPagamento(nota))}</div>
        </div>
        <div>
          <div class="footer-label">Responsável Pela Emissão</div>
          <div class="footer-value">${escapeHtml(getNotaPrintResponsavel(nota))}</div>
        </div>
      </div>

      ${
        numeroDoc
          ? `<div class="numero-doc">
        <div class="footer-value">${escapeHtml(numeroDoc)}</div>
      </div>`
          : ""
      }
    </div>
  </body>
</html>`;
};
