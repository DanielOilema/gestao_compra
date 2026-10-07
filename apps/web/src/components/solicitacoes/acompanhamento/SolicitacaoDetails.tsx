import React from "react";
import type {
  AprovacaoSolicitacao,
  CotacaoSolicitacao,
  NotaFiscalSolicitacao,
  PedidoSolicitacao,
  SolicitacaoAcompanhamento,
} from "@gestao-compra/shared";
import { getTipoCompraLabel } from "@gestao-compra/shared";
import { isoToBrDate } from "@/lib/dateBr";
import SolicitacaoTimeline from "./SolicitacaoTimeline";

interface SolicitacaoDetailsProps {
  solicitacao: SolicitacaoAcompanhamento;
}

const formatValor = (valor?: number): string | undefined => {
  if (valor == null || !Number.isFinite(valor)) return undefined;
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const formatQuando = (value?: string): string => {
  if (!value) return "";
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/.exec(value);
  if (!iso) return isoToBrDate(value);
  const data = `${iso[3]}/${iso[2]}/${iso[1]}`;
  return iso[4] ? `${data} ${iso[4]}:${iso[5]}` : data;
};

const Campo: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => {
  if (value == null || value === "") return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
};

const Secao: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-3">
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    {children}
  </section>
);

const AprovacaoSection: React.FC<{ aprovacao: AprovacaoSolicitacao }> = ({ aprovacao }) => {
  const pessoas = [...(aprovacao.aprovadores ?? []), ...(aprovacao.historico ?? [])];
  return (
    <Secao title="Aprovação">
      <dl className="space-y-2">
        <Campo label="Observações" value={aprovacao.observacoes} />
      </dl>
      {pessoas.length > 0 ? (
        <ul className="space-y-2">
          {pessoas.map((pessoa, index) => (
            <li key={`${pessoa.nome ?? "aprovador"}-${index}`} className="rounded-md bg-muted/50 p-2 text-sm">
              <p className="font-medium text-foreground">{pessoa.nome || "Aprovador"}</p>
              {pessoa.status ? <p className="text-muted-foreground">{pessoa.status}</p> : null}
              {pessoa.dataHora ? <p className="text-muted-foreground">{formatQuando(pessoa.dataHora)}</p> : null}
              {pessoa.observacao ? <p>{pessoa.observacao}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Secao>
  );
};

const CotacaoCard: React.FC<{ cotacao: CotacaoSolicitacao }> = ({ cotacao }) => (
  <article className="space-y-2 rounded-md border p-3">
    <dl className="grid gap-2">
      <Campo label="Número" value={cotacao.numero} />
      <Campo label="Status" value={cotacao.status} />
      <Campo label="Fornecedor escolhido" value={cotacao.fornecedorEscolhido} />
      <Campo label="Condições comerciais" value={cotacao.condicoesComerciais} />
    </dl>
    {cotacao.fornecedores && cotacao.fornecedores.length > 0 ? (
      <p className="text-sm text-foreground">
        Fornecedores: {cotacao.fornecedores.map((fornecedor) => fornecedor.nome).filter(Boolean).join(", ")}
      </p>
    ) : null}
    {cotacao.produtos && cotacao.produtos.length > 0 ? (
      <ul className="space-y-1 text-sm">
        {cotacao.produtos.map((produto, index) => (
          <li key={`${produto.codigo ?? produto.descricao ?? "produto"}-${index}`}>
            {[produto.codigo, produto.descricao].filter(Boolean).join(" — ") || "Produto"}
            {produto.quantidade != null ? ` · ${produto.quantidade}` : ""}
            {produto.preco != null ? ` · ${formatValor(produto.preco)}` : ""}
          </li>
        ))}
      </ul>
    ) : null}
  </article>
);

const PedidoCard: React.FC<{ pedido: PedidoSolicitacao }> = ({ pedido }) => (
  <article className="space-y-2 rounded-md border p-3">
    <dl className="grid gap-2">
      <Campo label="Número" value={pedido.numero} />
      <Campo label="Fornecedor" value={pedido.fornecedor} />
      <Campo label="Data" value={formatQuando(pedido.data)} />
      <Campo label="Valor" value={formatValor(pedido.valor)} />
      <Campo label="Status" value={pedido.status} />
    </dl>
    {pedido.itens && pedido.itens.length > 0 ? (
      <ul className="space-y-1 text-sm">
        {pedido.itens.map((item, index) => (
          <li key={`${item.item ?? item.produto ?? "item"}-${index}`}>
            {[item.produto, item.descricao].filter(Boolean).join(" — ") || "Item"}
            {item.quantidade != null ? ` · ${item.quantidade}` : ""}
            {item.valor != null ? ` · ${formatValor(item.valor)}` : ""}
          </li>
        ))}
      </ul>
    ) : null}
  </article>
);

const NotaCard: React.FC<{ nota: NotaFiscalSolicitacao }> = ({ nota }) => (
  <article className="rounded-md border p-3">
    <dl className="grid gap-2">
      <Campo label="Número" value={nota.numero} />
      <Campo label="Fornecedor" value={nota.fornecedor} />
      <Campo label="Data" value={formatQuando(nota.data)} />
      <Campo label="Valor" value={formatValor(nota.valor)} />
      <Campo label="Chave da NF-e" value={nota.chaveNfe} />
      <Campo label="Status da entrada" value={nota.statusEntrada} />
    </dl>
  </article>
);

const SolicitacaoDetails: React.FC<SolicitacaoDetailsProps> = ({ solicitacao }) => {
  const data = solicitacao.dataSolicitacao ? isoToBrDate(solicitacao.dataSolicitacao) : "";

  return (
    <div className="space-y-6">
      <Secao title="Andamento">
        <SolicitacaoTimeline statusAtual={solicitacao.statusAtual} />
      </Secao>

      <Secao title="Solicitação">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Campo label="Número" value={solicitacao.numero} />
          <Campo label="Filial" value={solicitacao.filial} />
          <Campo
            label="Tipo de compra"
            value={solicitacao.tipoCompra ? getTipoCompraLabel(solicitacao.tipoCompra) : undefined}
          />
          <Campo label="Solicitante" value={solicitacao.solicitante} />
          <Campo label="Data" value={data} />
          <Campo label="Centro de custo" value={solicitacao.centroCusto} />
          <Campo label="Itens" value={solicitacao.quantidadeItens} />
          <Campo label="Observações" value={solicitacao.observacoes} />
        </dl>
        {solicitacao.itens && solicitacao.itens.length > 0 ? (
          <ul className="space-y-2">
            {solicitacao.itens.map((item, index) => (
              <li key={`${item.item ?? item.produto ?? "item"}-${index}`} className="rounded-md bg-muted/50 p-2 text-sm">
                <p className="font-medium text-foreground">
                  {[item.produto, item.descricao].filter(Boolean).join(" — ") || `Item ${item.item ?? index + 1}`}
                </p>
                {item.quantidade != null ? <p className="text-muted-foreground">Quantidade: {item.quantidade}</p> : null}
                {item.centroCusto ? <p className="text-muted-foreground">Centro de custo: {item.centroCusto}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </Secao>

      {solicitacao.aprovacao ? <AprovacaoSection aprovacao={solicitacao.aprovacao} /> : null}

      {solicitacao.cotacoes && solicitacao.cotacoes.length > 0 ? (
        <Secao title="Cotação">
          <div className="space-y-2">
            {solicitacao.cotacoes.map((cotacao, index) => (
              <CotacaoCard key={`${cotacao.numero ?? "cotacao"}-${index}`} cotacao={cotacao} />
            ))}
          </div>
        </Secao>
      ) : null}

      {solicitacao.pedidos && solicitacao.pedidos.length > 0 ? (
        <Secao title="Pedido de compra">
          <div className="space-y-2">
            {solicitacao.pedidos.map((pedido, index) => (
              <PedidoCard key={`${pedido.numero ?? "pedido"}-${index}`} pedido={pedido} />
            ))}
          </div>
        </Secao>
      ) : null}

      {solicitacao.notasFiscais && solicitacao.notasFiscais.length > 0 ? (
        <Secao title="Pré-nota / Nota fiscal">
          <div className="space-y-2">
            {solicitacao.notasFiscais.map((nota, index) => (
              <NotaCard key={`${nota.numero ?? nota.chaveNfe ?? "nota"}-${index}`} nota={nota} />
            ))}
          </div>
        </Secao>
      ) : null}
    </div>
  );
};

export default SolicitacaoDetails;
