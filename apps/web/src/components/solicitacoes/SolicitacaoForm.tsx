import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader2, Percent, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Input,
  Textarea,
} from "@gestao-compra/ui";
import {
  ACAO_ALTERA_SC,
  ACAO_INCLUI_SC,
  ALTERAR_SOLICITACAO_STATUS_MESSAGE,
  formatNumeroSc,
  getDefaultDataEntrega,
  hasValidRateioCC,
  isSolicitacaoCompraAlteravelPorStatus,
  mapFormToIncluiSCPayload,
  mapPurchaseRequestToSolicitacaoDraft,
  listItensExcluidos,
  maxNumeroItem,
  nextNumeroItem,
  type PurchaseRequest,
  type RateioCCDraft,
  type SolicitacaoFormPayload,
  type SolicitacaoItemDraft,
  type TipoCompra,
} from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useIncluiSolicitacao } from "@/hooks/useIncluiSolicitacao";
import { brDateToIso, isoToBrDate } from "@/lib/dateBr";
import BrDateInput from "@/components/shared/BrDateInput";
import FilialSelect from "./inclusao/FilialSelect";
import TipoCompraSelect from "./inclusao/TipoCompraSelect";
import ProdutoCombobox from "./inclusao/ProdutoCombobox";
import CentroCustoCombobox from "./inclusao/CentroCustoCombobox";
import RateioCentroCustoDialog from "./inclusao/RateioCentroCustoDialog";
import SolicitacaoItensTable from "./inclusao/SolicitacaoItensTable";
import { isSolicitacaoAlterFormDirty, isSolicitacaoFormDirty, isSolicitacaoItemObservacaoPreenchida, type SolicitacaoDraftState } from "./inclusao/solicitacaoFormDirty";
import {
  mapPurchaseRequestToInclusaoDraft,
  type NovaSolicitacaoLocationState,
} from "./inclusao/copySolicitacaoCompra";
import { useSolicitacaoLeave } from "./inclusao/SolicitacaoLeaveContext";
import FormField from "@/components/inclusao/FormField";
import FormSection from "@/components/inclusao/FormSection";
import { FormGrid, FormGridItem } from "@/components/inclusao/FormGrid";

const itemDraftBaseSchema = z.object({
  produto: z.string().min(1, "Selecione o produto"),
  produtoDescricao: z.string().min(1, "Selecione o produto"),
  unidade: z.string().min(1, "Unidade obrigatória"),
  centroCusto: z.string(),
  centroCustoDescricao: z.string(),
  quantidade: z.coerce.number().gt(0, "Quantidade deve ser maior que zero"),
  observacao: z.string().trim().min(1, "Informe a observação"),
  placa: z.string(),
  dataEntrega: z
    .string()
    .min(1, "Informe a data de entrega")
    .refine((value) => brDateToIso(value) != null, "Data inválida. Use DD/MM/AAAA"),
});

type ItemDraftForm = z.infer<typeof itemDraftBaseSchema> & {
  rateioCC?: RateioCCDraft[];
};

const emptyDraft = (dataEntregaIso = ""): ItemDraftForm => ({
  produto: "",
  produtoDescricao: "",
  unidade: "UN",
  centroCusto: "",
  centroCustoDescricao: "",
  quantidade: 1,
  observacao: "",
  placa: "",
  dataEntrega: isoToBrDate(dataEntregaIso),
  rateioCC: undefined,
});

const createItemId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export interface SolicitacaoFormProps {
  mode?: "incluir" | "alterar";
  initialRequest?: PurchaseRequest;
}

const SolicitacaoForm: React.FC<SolicitacaoFormProps> = ({
  mode = "incluir",
  initialRequest,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setIsDirty, confirmLeave } = useSolicitacaoLeave();
  const incluiMutation = useIncluiSolicitacao();
  const locationState = location.state as NovaSolicitacaoLocationState | null;
  const [alterRequest] = React.useState<PurchaseRequest | undefined>(
    () => initialRequest ?? locationState?.alterFrom,
  );
  const isAlter = mode === "alterar" || Boolean(alterRequest);
  const [initialDraft] = React.useState(() => {
    if (alterRequest) {
      return mapPurchaseRequestToSolicitacaoDraft(alterRequest);
    }
    const copyFrom = locationState?.copyFrom;
    return copyFrom ? mapPurchaseRequestToInclusaoDraft(copyFrom) : null;
  });
  const [filial, setFilial] = React.useState(initialDraft?.filial ?? "");
  const [filialError, setFilialError] = React.useState<string>();
  const [tipoCompra, setTipoCompra] = React.useState<TipoCompra | "">(initialDraft?.tipoCompra ?? "");
  const [tipoCompraError, setTipoCompraError] = React.useState<string>();
  const [draft, setDraft] = React.useState<ItemDraftForm>(
    emptyDraft(tipoCompra ? getDefaultDataEntrega(tipoCompra) : ""),
  );
  const [draftErrors, setDraftErrors] = React.useState<Partial<Record<keyof ItemDraftForm, string>>>({});
  const [itens, setItens] = React.useState<SolicitacaoItemDraft[]>(initialDraft?.itens ?? []);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [rateioOpen, setRateioOpen] = React.useState(false);
  const numeroItemReservado = React.useMemo(
    () => (isAlter && initialDraft ? maxNumeroItem(initialDraft.itens) : 0),
    [isAlter, initialDraft],
  );

  const filialSelected = Boolean(filial);
  const isSubmitting = incluiMutation.isPending;
  const defaultDataEntregaBr = tipoCompra ? isoToBrDate(getDefaultDataEntrega(tipoCompra)) : "";
  const numeroScLabel = alterRequest ? formatNumeroSc(alterRequest.numero) : "";
  const hasRateio = hasValidRateioCC(draft.rateioCC);

  React.useEffect(() => {
    const draftState: SolicitacaoDraftState = {
      produto: draft.produto ?? "",
      centroCusto: draft.centroCusto ?? "",
      quantidade: draft.quantidade ?? 1,
      observacao: draft.observacao,
      placa: draft.placa,
      dataEntrega: draft.dataEntrega,
      rateioCC: draft.rateioCC,
    };
    if (isAlter && initialDraft) {
      setIsDirty(
        isSolicitacaoAlterFormDirty(
          initialDraft,
          { filial, tipoCompra, itens },
          draftState,
          defaultDataEntregaBr,
        ),
      );
      return;
    }
    setIsDirty(isSolicitacaoFormDirty(filial, tipoCompra, itens, draftState));
  }, [filial, tipoCompra, itens, draft, setIsDirty, isAlter, initialDraft, defaultDataEntregaBr]);

  React.useEffect(() => {
    if (!tipoCompra) return;
    setDraft((prev) => ({
      ...prev,
      dataEntrega: isoToBrDate(getDefaultDataEntrega(tipoCompra)),
    }));
  }, [tipoCompra]);

  const updateDraft = <K extends keyof ItemDraftForm>(key: K, value: ItemDraftForm[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDraftErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const resetDraft = () => {
    const dataEntrega = tipoCompra ? getDefaultDataEntrega(tipoCompra) : "";
    setDraft(emptyDraft(dataEntrega));
    setDraftErrors({});
    setEditingId(null);
  };

  const handleAddItem = () => {
    if (!filialSelected) {
      setFilialError("Selecione a filial antes de adicionar itens");
      toast.error("Selecione a filial antes de adicionar itens");
      return;
    }

    if (!tipoCompra) {
      setTipoCompraError("Selecione o tipo de compra antes de adicionar itens");
      toast.error("Selecione o tipo de compra antes de adicionar itens");
      return;
    }

    const parsed = itemDraftBaseSchema.safeParse(draft);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ItemDraftForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ItemDraftForm;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setDraftErrors(fieldErrors);
      toast.error("Verifique os campos do item");
      return;
    }

    const rateioOk = hasValidRateioCC(draft.rateioCC);
    if (!rateioOk && !parsed.data.centroCusto.trim()) {
      setDraftErrors((prev) => ({
        ...prev,
        centroCusto: "Informe um centro de custo ou um rateio",
      }));
      toast.error("Informe um centro de custo ou um rateio");
      return;
    }

    if (!rateioOk && !parsed.data.centroCustoDescricao.trim()) {
      setDraftErrors((prev) => ({
        ...prev,
        centroCusto: "Selecione o centro de custo",
      }));
      toast.error("Selecione o centro de custo");
      return;
    }

    const dataEntregaIso = brDateToIso(parsed.data.dataEntrega);
    if (!dataEntregaIso) {
      setDraftErrors((prev) => ({ ...prev, dataEntrega: "Data inválida. Use DD/MM/AAAA" }));
      toast.error("Data de entrega inválida");
      return;
    }

    const current = editingId ? itens.find((row) => row.id === editingId) : undefined;
    const parsedItem = parsed.data;
    const item: SolicitacaoItemDraft = {
      id: editingId ?? createItemId(),
      item:
        current?.item?.trim() ||
        nextNumeroItem(itens, isAlter ? numeroItemReservado : 0),
      produto: parsedItem.produto ?? "",
      produtoDescricao: parsedItem.produtoDescricao ?? "",
      unidade: parsedItem.unidade ?? "UN",
      centroCusto: rateioOk ? "" : (parsedItem.centroCusto ?? ""),
      centroCustoDescricao: rateioOk ? "" : (parsedItem.centroCustoDescricao ?? ""),
      quantidade: parsedItem.quantidade ?? 1,
      observacao: parsedItem.observacao,
      placa: parsedItem.placa?.trim() ?? "",
      dataEntrega: dataEntregaIso,
      rateioCC: rateioOk ? draft.rateioCC : undefined,
    };

    if (editingId) {
      setItens((prev) => prev.map((row) => (row.id === editingId ? item : row)));
      toast.success("Item atualizado");
    } else {
      setItens((prev) => [...prev, item]);
      toast.success("Item adicionado");
    }

    resetDraft();
  };

  const handleEditItem = (item: SolicitacaoItemDraft) => {
    setDraft({
      produto: item.produto,
      produtoDescricao: item.produtoDescricao,
      unidade: item.unidade,
      centroCusto: item.centroCusto,
      centroCustoDescricao: item.centroCustoDescricao,
      quantidade: item.quantidade,
      observacao: item.observacao ?? "",
      placa: item.placa ?? "",
      dataEntrega: isoToBrDate(item.dataEntrega),
      rateioCC: item.rateioCC,
    });
    setEditingId(item.id);
    setDraftErrors({});
  };

  const handleRemoveItem = (id: string) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetDraft();
    toast.success("Item removido");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!filial) {
      setFilialError("Selecione a filial");
      toast.error("Selecione a filial");
      return;
    }

    if (!tipoCompra) {
      setTipoCompraError("Selecione o tipo de compra");
      toast.error("Selecione o tipo de compra");
      return;
    }

    if (itens.length === 0) {
      toast.error("Adicione pelo menos um item à solicitação");
      return;
    }

    const solicitante = user?.nome?.trim();
    if (!solicitante) {
      toast.error("Usuário logado inválido. Faça login novamente.");
      return;
    }

    if (itens.some((item) => !item.dataEntrega)) {
      toast.error("Há itens sem data de entrega. Edite o item e informe a data.");
      return;
    }

    if (itens.some((item) => !isSolicitacaoItemObservacaoPreenchida(item.observacao))) {
      toast.error("Há itens sem observação. Edite o item e informe a observação.");
      return;
    }

    if (
      itens.some(
        (item) => !hasValidRateioCC(item.rateioCC) && !item.centroCusto.trim(),
      )
    ) {
      toast.error("Há itens sem centro de custo ou rateio. Edite o item e complete o rateio.");
      return;
    }

    const formPayload: SolicitacaoFormPayload = {
      filial,
      tipoCompra,
      itens: itens.map(({ id: _id, ...item }) => item),
    };

    try {
      if (isAlter) {
        if (!alterRequest || !isSolicitacaoCompraAlteravelPorStatus(alterRequest)) {
          toast.error(ALTERAR_SOLICITACAO_STATUS_MESSAGE);
          return;
        }
        const apiPayload = mapFormToIncluiSCPayload(formPayload, solicitante, {
          acao: ACAO_ALTERA_SC,
          numeroSC: alterRequest.numero,
          numeroItemReservado,
          excluir:
            initialDraft != null
              ? listItensExcluidos(initialDraft.itens, itens)
              : [],
        });
        await incluiMutation.mutateAsync(apiPayload);
      } else {
        const apiPayload = mapFormToIncluiSCPayload(formPayload, solicitante, {
          acao: ACAO_INCLUI_SC,
        });
        await incluiMutation.mutateAsync(apiPayload);
      }
      setIsDirty(false);
      navigate("/solicitacoes-compra");
    } catch {
      // toast já tratado no hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {isAlter ? `Alterar solicitação ${numeroScLabel}` : "Dados da solicitação"}
        </h2>
        <FormGrid>
          <FilialSelect
            value={filial}
            onValueChange={(value) => {
              setFilial(value);
              setFilialError(undefined);
            }}
            disabled={isAlter}
            error={filialError}
          />
          <TipoCompraSelect
            value={tipoCompra}
            onValueChange={(value) => {
              setTipoCompra(value);
              setTipoCompraError(undefined);
            }}
            error={tipoCompraError}
          />
        </FormGrid>
      </section>

      <FormSection>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            {editingId ? "Editar item" : "Adicionar item"}
          </h2>
          {editingId ? (
            <Button type="button" variant="ghost" size="sm" onClick={resetDraft}>
              Cancelar edição
            </Button>
          ) : null}
        </div>

        <FormGrid>
          <FormGridItem span="full">
            <ProdutoCombobox
              value={draft.produto}
              selectedLabel={
                draft.produto
                  ? `${draft.produto} - ${draft.produtoDescricao}`
                  : undefined
              }
              onValueChange={(codigo, option) => {
                updateDraft("produto", codigo);
                if (option) {
                  updateDraft("produtoDescricao", option.descricao);
                  updateDraft("unidade", option.unidade || "UN");
                }
              }}
              disabled={!filialSelected}
              error={draftErrors.produto}
            />
          </FormGridItem>

          <FormGridItem span={2}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <CentroCustoCombobox
                  value={hasRateio ? "" : draft.centroCusto}
                  selectedLabel={
                    hasRateio
                      ? `Rateio (${draft.rateioCC?.length ?? 0} centros)`
                      : draft.centroCusto
                        ? `${draft.centroCusto} - ${draft.centroCustoDescricao}`
                        : undefined
                  }
                  onValueChange={(custo, option) => {
                    setDraft((prev) => ({
                      ...prev,
                      centroCusto: custo,
                      centroCustoDescricao: option?.descricao ?? "",
                      rateioCC: undefined,
                    }));
                    setDraftErrors((prev) => ({ ...prev, centroCusto: undefined }));
                  }}
                  disabled={!filialSelected || hasRateio}
                  required={!hasRateio}
                  error={draftErrors.centroCusto}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full shrink-0 sm:w-auto"
                disabled={!filialSelected}
                onClick={() => setRateioOpen(true)}
              >
                <Percent className="mr-2 h-4 w-4" />
                Rateio
              </Button>
            </div>
          </FormGridItem>

          <FormField label="Quantidade" htmlFor="quantidade" required error={draftErrors.quantidade}>
            <Input
              id="quantidade"
              type="number"
              min={0}
              step="any"
              value={draft.quantidade}
              disabled={!filialSelected}
              onChange={(e) => updateDraft("quantidade", Number(e.target.value))}
            />
          </FormField>

          <FormField label="Placa" htmlFor="placa" error={draftErrors.placa}>
            <Input
              id="placa"
              value={draft.placa ?? ""}
              disabled={!filialSelected}
              placeholder="Placa do veículo"
              onChange={(e) => updateDraft("placa", e.target.value.toUpperCase())}
            />
          </FormField>

          <FormGridItem span={2}>
            <FormField
              label="Observações"
              htmlFor="observacao"
              required
              error={draftErrors.observacao}
            >
              <Textarea
                id="observacao"
                placeholder="Observações do item"
                value={draft.observacao ?? ""}
                disabled={!filialSelected}
                onChange={(e) => updateDraft("observacao", e.target.value)}
              />
            </FormField>
          </FormGridItem>

          <FormField
            label="Data de entrega"
            htmlFor="data-entrega"
            required
            error={draftErrors.dataEntrega}
          >
            <BrDateInput
              id="data-entrega"
              value={draft.dataEntrega}
              disabled={!filialSelected || !tipoCompra}
              onChange={(value) => updateDraft("dataEntrega", value)}
            />
          </FormField>
        </FormGrid>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={!filialSelected || !tipoCompra}
            onClick={handleAddItem}
          >
            <Plus className="mr-2 h-4 w-4" />
            {editingId ? "Salvar item" : "Adicionar item"}
          </Button>
        </div>
      </FormSection>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Itens da solicitação</h2>
        <SolicitacaoItensTable
          itens={itens}
          onEdit={handleEditItem}
          onRemove={handleRemoveItem}
        />
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
          onClick={() => confirmLeave(() => navigate("/solicitacoes-compra"))}
        >
          Voltar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isAlter ? "Alterando..." : "Incluindo..."}
            </>
          ) : isAlter ? (
            "Alterar"
          ) : (
            "Incluir"
          )}
        </Button>
      </div>

      <RateioCentroCustoDialog
        open={rateioOpen}
        onOpenChange={setRateioOpen}
        value={draft.rateioCC}
        disabled={!filialSelected}
        onConfirm={(rateio) => {
          setDraft((prev) => ({
            ...prev,
            rateioCC: rateio,
            centroCusto: "",
            centroCustoDescricao: "",
          }));
          setDraftErrors((prev) => ({ ...prev, centroCusto: undefined }));
        }}
        onClear={() => {
          setDraft((prev) => ({
            ...prev,
            rateioCC: undefined,
          }));
        }}
      />
    </form>
  );
};

export default SolicitacaoForm;
