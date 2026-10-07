import React from "react";
import { formatRastroData, type RastroNo } from "@gestao-compra/shared";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@gestao-compra/ui";
import { ArrowLeft } from "lucide-react";

interface RastroDocumentoDetalheProps {
  no: RastroNo;
  onBack: () => void;
}

interface Campo {
  label: string;
  value: React.ReactNode;
}

interface Celula {
  label: string;
  value: string;
  align?: "right";
}

const texto = (value?: string): string => (value?.trim() ? value : "-");

const quantidade = (value?: number): string =>
  value == null ? "-" : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(value);

const moeda = (value?: number): string =>
  value == null
    ? "-"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const data = (value?: string): string => formatRastroData(value) || "-";

const statusClassName = (status: string): string => {
  const value = status.trim().toLowerCase();
  if (value.includes("classif")) return "border-green-600 text-green-700";
  if (value.includes("bloq") || value.includes("cancel")) return "border-red-500 text-red-700";
  return "text-foreground";
};

const tituloDoNo = (no: RastroNo): string => {
  if (no.tipo === "solicitacao") return `Solicitação ${texto(no.documento.numero)}`;
  if (no.tipo === "cotacao") return `Cotação ${texto(no.documento.cotacao)}`;
  if (no.tipo === "pedido") return `Pedido ${texto(no.documento.pedido)}`;
  return `Nota fiscal ${texto(no.documento.notaFiscal)}`;
};

const descricaoDoNo = (no: RastroNo): string => {
  if (no.tipo === "solicitacao") return "Solicitação de Compra";
  return no.documento.nomeFornecedor || no.documento.fornecedor || "Documento do rastro";
};

const camposDoNo = (no: RastroNo): Campo[] => {
  if (no.tipo === "solicitacao") {
    return [
      { label: "Número", value: texto(no.documento.numero) },
      { label: "Filial", value: texto(no.documento.filial) },
      { label: "Emissão", value: data(no.documento.emissao) },
    ];
  }
  if (no.tipo === "cotacao") {
    return [
      { label: "Cotação", value: texto(no.documento.cotacao) },
      { label: "Fornecedor", value: texto(no.documento.fornecedor) },
      { label: "Nome do fornecedor", value: texto(no.documento.nomeFornecedor) },
      { label: "Loja", value: texto(no.documento.loja) },
      { label: "Condição de pagamento", value: texto(no.documento.condPagto) },
      { label: "Emissão", value: data(no.documento.emissao) },
    ];
  }
  if (no.tipo === "pedido") {
    return [
      { label: "Pedido", value: texto(no.documento.pedido) },
      { label: "Fornecedor", value: texto(no.documento.fornecedor) },
      { label: "Nome do fornecedor", value: texto(no.documento.nomeFornecedor) },
      { label: "Loja", value: texto(no.documento.loja) },
      { label: "Emissão", value: data(no.documento.emissao) },
    ];
  }
  const campos: Campo[] = [
    { label: "Nota fiscal", value: texto(no.documento.notaFiscal) },
    { label: "Documento", value: texto(no.documento.documento) },
    { label: "Série", value: texto(no.documento.serie) },
    { label: "Emissão", value: data(no.documento.emissao) },
    { label: "Fornecedor", value: texto(no.documento.fornecedor) },
    { label: "Nome do fornecedor", value: texto(no.documento.nomeFornecedor) },
    { label: "Loja", value: texto(no.documento.loja) },
  ];
  if (no.documento.status) {
    campos.splice(3, 0, {
      label: "Status",
      value: (
        <Badge variant="outline" className={statusClassName(no.documento.status)}>
          {no.documento.status}
        </Badge>
      ),
    });
  }
  return campos;
};

const linhasDoNo = (no: RastroNo): Celula[][] => {
  if (no.tipo === "solicitacao") {
    return no.documento.itens.map((item) => [
      { label: "Item", value: texto(item.item) },
      { label: "Produto", value: texto(item.produto) },
      { label: "Quantidade", value: quantidade(item.quantidade), align: "right" },
      { label: "Unidade", value: texto(item.unidadeMedida) },
      { label: "Centro de custo", value: texto(item.centroCusto) },
      { label: "Observação", value: texto(item.observacao) },
    ]);
  }
  if (no.tipo === "cotacao") {
    return no.documento.itens.map((item) => [
      { label: "Item", value: texto(item.item) },
      { label: "Produto", value: texto(item.produto) },
      { label: "Quantidade", value: quantidade(item.quantidade), align: "right" },
      { label: "Preço", value: moeda(item.preco), align: "right" },
      { label: "Desconto", value: moeda(item.desconto), align: "right" },
      { label: "Total", value: moeda(item.total), align: "right" },
      { label: "Item da SC", value: texto(item.itemSC) },
      { label: "Pedido", value: texto(item.numPedido) },
      { label: "Item do pedido", value: texto(item.itemPedido) },
    ]);
  }
  if (no.tipo === "pedido") {
    return no.documento.itens.map((item) => [
      { label: "Item", value: texto(item.item) },
      { label: "Produto", value: texto(item.produto) },
      { label: "Quantidade", value: quantidade(item.quantidade), align: "right" },
      { label: "Preço", value: moeda(item.preco), align: "right" },
      { label: "Total", value: moeda(item.total), align: "right" },
      { label: "Centro de custo", value: texto(item.centroCusto) },
    ]);
  }
  return no.documento.itens.map((item) => [
    { label: "Item", value: texto(item.item) },
    { label: "Produto", value: texto(item.produto) },
    { label: "Descrição", value: texto(item.descricao) },
    { label: "Quantidade", value: quantidade(item.quantidade), align: "right" },
    { label: "Valor unitário", value: moeda(item.valorUnitario), align: "right" },
    { label: "Total", value: moeda(item.total), align: "right" },
    { label: "TES", value: texto(item.tes) },
    { label: "Centro de custo", value: texto(item.centroCusto) },
    { label: "Pedido", value: texto(item.pedido) },
    { label: "Item do pedido", value: texto(item.itemPedido) },
  ]);
};

const ItensDocumento: React.FC<{ linhas: Celula[][] }> = ({ linhas }) => {
  if (linhas.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum item informado.</p>;
  }
  const cabecalho = linhas[0];
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {linhas.map((linha, index) => (
          <div key={index} className="space-y-2 rounded-lg bg-muted/50 p-3">
            {linha.map((celula) => (
              <div key={celula.label}>
                <p className="text-xs text-muted-foreground">{celula.label}</p>
                <p className="text-sm font-medium text-foreground">{celula.value}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {cabecalho.map((celula) => (
                <TableHead key={celula.label} className={celula.align === "right" ? "text-right" : undefined}>
                  {celula.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((linha, index) => (
              <TableRow key={index}>
                {linha.map((celula) => (
                  <TableCell
                    key={celula.label}
                    className={celula.align === "right" ? "text-right font-medium" : "text-foreground"}
                  >
                    {celula.value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

const RastroDocumentoDetalhe: React.FC<RastroDocumentoDetalheProps> = ({ no, onBack }) => {
  const campos = camposDoNo(no);
  const linhas = linhasDoNo(no);

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 pr-8 sm:gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} className="shrink-0" aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-foreground sm:text-xl">{tituloDoNo(no)}</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{descricaoDoNo(no)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {campos.map((campo) => (
          <div key={campo.label}>
            <p className="text-xs text-muted-foreground">{campo.label}</p>
            <div className="text-sm font-medium text-foreground">{campo.value}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pb-3 sm:pt-6">
          <CardTitle className="text-sm sm:text-base">Itens ({linhas.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
          <ItensDocumento linhas={linhas} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RastroDocumentoDetalhe;
