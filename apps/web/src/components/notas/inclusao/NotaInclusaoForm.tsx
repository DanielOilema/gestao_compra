import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from "@gestao-compra/ui";
import {
  FORMA_PAGAMENTO_CREDITO,
  getNotaDraftItemsTotal,
  isDeposito,
  mapFormToIncluiNotaDCPayload,
  validateNotaPagamento,
  type FormaPagamentoNotaDC,
  type NotaItemDraft,
  type NotaTipo,
} from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useIncluiNotaDC } from "@/hooks/useIncluiNotaDC";
import { brDateToIso, isoToBrDate } from "@/lib/dateBr";
import BrDateInput from "@/components/shared/BrDateInput";
import FilialSelect from "@/components/solicitacoes/inclusao/FilialSelect";
import CliForCombobox from "./CliForCombobox";
import NaturezaCombobox from "./NaturezaCombobox";
import TesCombobox from "./TesCombobox";
import FormaPagamentoNotaSelect from "./FormaPagamentoNotaSelect";
import SetorCombobox from "./SetorCombobox";
import NotaItensTable from "./NotaItensTable";
import NotaFormField from "./NotaFormField";
import NotaFormSection from "./NotaFormSection";
import { NotaFormGrid, NotaFormGridItem } from "./NotaFormGrid";
import { useNotaLeave } from "./NotaLeaveContext";
import {
  emptyNotaInclusaoDraft,
  mapNotaToInclusaoDraft,
  type NovaNotaLocationState,
} from "./copyNotaDebCre";

const todayBrDate = () => isoToBrDate(new Date().toISOString().slice(0, 10));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const NotaInclusaoForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setIsDirty, confirmLeave } = useNotaLeave();
  const incluiMutation = useIncluiNotaDC();
  const [initialDraft] = React.useState(() => {
    const copyFrom = (location.state as NovaNotaLocationState | null)?.copyFrom;
    return copyFrom ? mapNotaToInclusaoDraft(copyFrom) : emptyNotaInclusaoDraft();
  });

  const [filial, setFilial] = React.useState(initialDraft.filial);
  const [tipo, setTipo] = React.useState<NotaTipo>(initialDraft.tipo);
  const [cliForKey, setCliForKey] = React.useState(initialDraft.cliForKey);
  const [cliForLabel, setCliForLabel] = React.useState(initialDraft.cliForLabel);
  const [codigoCliFor, setCodigoCliFor] = React.useState(initialDraft.codigoCliFor);
  const [lojaCliFor, setLojaCliFor] = React.useState(initialDraft.lojaCliFor);
  const [nomeCliFor, setNomeCliFor] = React.useState(initialDraft.nomeCliFor);
  const [cnpj, setCnpj] = React.useState(initialDraft.cnpj);
  const [dataEmissao, setDataEmissao] = React.useState(todayBrDate());
  const [dataVencimento, setDataVencimento] = React.useState("");
  const [referenteA, setReferenteA] = React.useState(initialDraft.referenteA);
  const [formaPagamento, setFormaPagamento] = React.useState<FormaPagamentoNotaDC | "">(
    initialDraft.formaPagamento,
  );
  const [banco, setBanco] = React.useState(initialDraft.banco);
  const [agencia, setAgencia] = React.useState(initialDraft.agencia);
  const [conta, setConta] = React.useState(initialDraft.conta);
  const [nomeRecebedor, setNomeRecebedor] = React.useState(initialDraft.nomeRecebedor);
  const [cpfCnpjRecebedor, setCpfCnpjRecebedor] = React.useState(initialDraft.cpfCnpjRecebedor);
  const [setor, setSetor] = React.useState(initialDraft.setor);
  const [setorLabel, setSetorLabel] = React.useState(initialDraft.setorLabel);
  const [natureza, setNatureza] = React.useState(initialDraft.natureza);
  const [naturezaLabel, setNaturezaLabel] = React.useState(initialDraft.naturezaLabel);
  const [tes, setTes] = React.useState(initialDraft.tes);
  const [tesLabel, setTesLabel] = React.useState(initialDraft.tesLabel);
  const [itens, setItens] = React.useState<NotaItemDraft[]>(initialDraft.itens);
  const prevTipoRef = React.useRef(tipo);
  const prevFilialRef = React.useRef(filial);

  const isCredito = tipo === "credito";
  const isDepositoForma = isDeposito(formaPagamento);
  const isSubmitting = incluiMutation.isPending;
  const valorTotal = getNotaDraftItemsTotal(itens);
  const responsavel = user?.nome ?? "";

  React.useEffect(() => {
    const dirty =
      Boolean(filial) ||
      Boolean(cliForKey) ||
      Boolean(cnpj) ||
      Boolean(dataVencimento) ||
      Boolean(referenteA.trim()) ||
      Boolean(formaPagamento) ||
      Boolean(banco) ||
      Boolean(agencia) ||
      Boolean(conta) ||
      Boolean(nomeRecebedor.trim()) ||
      Boolean(cpfCnpjRecebedor.trim()) ||
      Boolean(setor) ||
      Boolean(natureza) ||
      Boolean(tes) ||
      itens.length > 0 ||
      dataEmissao !== todayBrDate() ||
      tipo !== "debito";
    setIsDirty(dirty);
  }, [
    filial,
    cliForKey,
    cnpj,
    dataVencimento,
    referenteA,
    formaPagamento,
    banco,
    agencia,
    conta,
    nomeRecebedor,
    cpfCnpjRecebedor,
    setor,
    natureza,
    tes,
    itens,
    dataEmissao,
    tipo,
    setIsDirty,
  ]);

  React.useEffect(() => {
    if (isCredito) {
      setFormaPagamento(FORMA_PAGAMENTO_CREDITO);
      setBanco("");
      setAgencia("");
      setConta("");
    } else if (formaPagamento === FORMA_PAGAMENTO_CREDITO) {
      setFormaPagamento("");
    }
  }, [isCredito, formaPagamento]);

  React.useEffect(() => {
    if (!isDepositoForma) {
      setBanco("");
      setAgencia("");
      setConta("");
    }
  }, [isDepositoForma]);

  React.useEffect(() => {
    if (!isCredito) {
      setNatureza("");
      setNaturezaLabel("");
      setTes("");
      setTesLabel("");
    }
  }, [isCredito]);

  React.useEffect(() => {
    if (prevFilialRef.current === filial) return;
    prevFilialRef.current = filial;
    setTes("");
    setTesLabel("");
  }, [filial]);

  React.useEffect(() => {
    if (prevTipoRef.current === tipo) return;
    prevTipoRef.current = tipo;
    setCliForKey("");
    setCliForLabel("");
    setCodigoCliFor("");
    setLojaCliFor("");
    setNomeCliFor("");
    setCnpj("");
  }, [tipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!filial) {
      toast.error("Selecione a filial");
      return;
    }
    if (!codigoCliFor || !lojaCliFor) {
      toast.error("Selecione o cliente/fornecedor");
      return;
    }
    if (!dataEmissao.trim()) {
      toast.error("Informe a data de emissão");
      return;
    }
    const dataEmissaoIso = brDateToIso(dataEmissao);
    if (!dataEmissaoIso) {
      toast.error("Data de emissão inválida. Use DD/MM/AAAA");
      return;
    }
    if (!dataVencimento.trim()) {
      toast.error("Informe a data de vencimento");
      return;
    }
    const dataVencimentoIso = brDateToIso(dataVencimento);
    if (!dataVencimentoIso) {
      toast.error("Data de vencimento inválida. Use DD/MM/AAAA");
      return;
    }
    if (dataVencimentoIso < dataEmissaoIso) {
      toast.error("A data de vencimento não pode ser anterior à data de emissão");
      return;
    }
    if (!referenteA.trim()) {
      toast.error("Informe o campo Referente a");
      return;
    }

    const pagamentoValidation = validateNotaPagamento({
      tipo,
      formaPagamento,
      banco,
      agencia,
      conta,
    });
    if (!pagamentoValidation.valid) {
      toast.error(pagamentoValidation.error ?? "Verifique as informações de pagamento");
      return;
    }

    if (isCredito && !natureza) {
      toast.error("Selecione a natureza");
      return;
    }
    if (isCredito && !tes) {
      toast.error("Selecione o TES");
      return;
    }
    if (itens.length === 0) {
      toast.error("Adicione ao menos um item");
      return;
    }
    if (tipo === "debito" && itens.some((i) => !i.centroCusto)) {
      toast.error("Centro de custo é obrigatório em todos os itens de débito");
      return;
    }
    if (!responsavel) {
      toast.error("Responsável não identificado. Faça login novamente.");
      return;
    }
    if (!setor) {
      toast.error("Selecione o setor");
      return;
    }

    const payload = mapFormToIncluiNotaDCPayload(
      {
        filial,
        tipo,
        codigoCliFor,
        lojaCliFor,
        nomeCliFor,
        cnpj,
        dataEmissao: dataEmissaoIso,
        dataVencimento: dataVencimentoIso,
        referenteA: referenteA.trim(),
        setor,
        natureza: isCredito ? natureza : undefined,
        tes: isCredito ? tes : undefined,
        formaPagamento: formaPagamento as FormaPagamentoNotaDC,
        banco: isDepositoForma ? banco : undefined,
        agencia: isDepositoForma ? agencia : undefined,
        conta: isDepositoForma ? conta : undefined,
        nomeRecebedor: nomeRecebedor.trim() || undefined,
        cpfCnpjRecebedor: cpfCnpjRecebedor.trim() || undefined,
        itens: itens.map(({ id: _id, ...rest }) => rest),
      },
      responsavel,
    );

    try {
      await incluiMutation.mutateAsync(payload);
      setIsDirty(false);
      navigate("/notas-debito-credito");
    } catch {
      // toast já tratado no hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
      <NotaFormGrid>
        <FilialSelect value={filial} onValueChange={setFilial} disabled={isSubmitting} />

        <div className="space-y-3">
          <Label>Tipo *</Label>
          <RadioGroup
            value={tipo}
            onValueChange={(v) => setTipo(v as NotaTipo)}
            className="flex flex-col gap-3 pt-1 sm:flex-row sm:gap-6 sm:pt-2"
            disabled={isSubmitting}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="debito" id="nota-tipo-debito" />
              <Label htmlFor="nota-tipo-debito" className="font-normal cursor-pointer">
                Débito
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credito" id="nota-tipo-credito" />
              <Label htmlFor="nota-tipo-credito" className="font-normal cursor-pointer">
                Crédito
              </Label>
            </div>
          </RadioGroup>
        </div>

        <NotaFormGridItem span={2}>
          <CliForCombobox
            tipo={tipo}
            value={cliForKey}
            selectedLabel={cliForLabel || undefined}
            disabled={isSubmitting}
            onValueChange={(key, option) => {
              setCliForKey(key);
              if (option) {
                setCodigoCliFor(option.codigo);
                setLojaCliFor(option.loja);
                setNomeCliFor(option.nome);
                setCnpj(option.cnpj);
                setCliForLabel(`${option.codigo}/${option.loja} - ${option.nome}`);
              } else if (key.includes("|")) {
                const [codigo, loja] = key.split("|");
                setCodigoCliFor(codigo ?? "");
                setLojaCliFor(loja ?? "");
              } else {
                setCodigoCliFor("");
                setLojaCliFor("");
                setNomeCliFor("");
                setCliForLabel("");
              }
            }}
          />
        </NotaFormGridItem>

        <NotaFormField label="CNPJ" htmlFor="cnpj">
          <Input
            id="cnpj"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            disabled={isSubmitting}
          />
        </NotaFormField>

        <NotaFormField label="Data de emissão" htmlFor="data-emissao" required>
          <BrDateInput
            id="data-emissao"
            value={dataEmissao}
            onChange={setDataEmissao}
            disabled={isSubmitting}
          />
        </NotaFormField>

        <NotaFormField label="Data de vencimento" htmlFor="data-vencimento" required>
          <BrDateInput
            id="data-vencimento"
            value={dataVencimento}
            onChange={setDataVencimento}
            disabled={isSubmitting}
          />
        </NotaFormField>

        <NotaFormField label="Responsável pela emissão" htmlFor="responsavel">
          <Input id="responsavel" value={responsavel} readOnly className="bg-muted" />
        </NotaFormField>

        <SetorCombobox
          value={setor}
          selectedLabel={setorLabel || undefined}
          disabled={isSubmitting}
          onValueChange={(codigo, option) => {
            setSetor(codigo);
            setSetorLabel(
              option ? `${option.codigo} - ${option.descricao}` : codigo,
            );
          }}
        />

        <NotaFormGridItem span="full">
          <NotaFormField label="Referente a" htmlFor="referente-a" required>
            <Textarea
              id="referente-a"
              value={referenteA}
              onChange={(e) => setReferenteA(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </NotaFormField>
        </NotaFormGridItem>
      </NotaFormGrid>

      <NotaFormSection title="Informações de pagamento">
        <NotaFormGrid desktopColumns={3}>
          <FormaPagamentoNotaSelect
            tipo={tipo}
            value={formaPagamento}
            onValueChange={setFormaPagamento}
            disabled={isSubmitting}
          />

          {isDepositoForma ? (
            <>
              <NotaFormField label="Banco" htmlFor="banco" required>
                <Input
                  id="banco"
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  disabled={isSubmitting}
                />
              </NotaFormField>
              <NotaFormField label="Agência" htmlFor="agencia" required>
                <Input
                  id="agencia"
                  value={agencia}
                  onChange={(e) => setAgencia(e.target.value)}
                  disabled={isSubmitting}
                />
              </NotaFormField>
              <NotaFormField label="Conta" htmlFor="conta" required>
                <Input
                  id="conta"
                  value={conta}
                  onChange={(e) => setConta(e.target.value)}
                  disabled={isSubmitting}
                />
              </NotaFormField>
            </>
          ) : null}

          <NotaFormField label="Nome recebedor" htmlFor="nome-recebedor">
            <Input
              id="nome-recebedor"
              value={nomeRecebedor}
              onChange={(e) => setNomeRecebedor(e.target.value)}
              disabled={isSubmitting}
            />
          </NotaFormField>

          <NotaFormField label="CPF/CNPJ recebedor" htmlFor="cpf-cnpj-recebedor">
            <Input
              id="cpf-cnpj-recebedor"
              value={cpfCnpjRecebedor}
              onChange={(e) => setCpfCnpjRecebedor(e.target.value)}
              disabled={isSubmitting}
            />
          </NotaFormField>
        </NotaFormGrid>
      </NotaFormSection>

      {isCredito ? (
        <NotaFormGrid>
          <NaturezaCombobox
            value={natureza}
            selectedLabel={naturezaLabel || undefined}
            disabled={isSubmitting}
            onValueChange={(codigo, option) => {
              setNatureza(codigo);
              setNaturezaLabel(
                option ? `${option.codigo} - ${option.descricao}` : codigo,
              );
            }}
          />
          <TesCombobox
            filial={filial}
            value={tes}
            selectedLabel={tesLabel || undefined}
            disabled={isSubmitting}
            onValueChange={(codigo, option) => {
              setTes(codigo);
              setTesLabel(option ? `${option.codigo} - ${option.descricao}` : codigo);
            }}
          />
        </NotaFormGrid>
      ) : null}

      <NotaItensTable items={itens} tipo={tipo} onChange={setItens} />

      <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <span className="text-sm font-medium">Valor total</span>
        <span className="text-lg font-semibold text-primary sm:text-right">{formatCurrency(valorTotal)}</span>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
          onClick={() => confirmLeave(() => navigate("/notas-debito-credito"))}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar nota
        </Button>
      </div>
    </form>
  );
};

export default NotaInclusaoForm;
