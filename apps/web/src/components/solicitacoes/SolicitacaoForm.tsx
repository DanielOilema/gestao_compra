import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
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
  isSolicitacaoCompraAlteravelPorStatus,
  mapFormToIncluiSCPayload,
  mapPurchaseRequestToSolicitacaoDraft,
  type PurchaseRequest,
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

const itemDraftSchema = z.object({
  produto: z.string().min(1, "Selecione o produto"),
  produtoDescricao: z.string().min(1, "Selecione o produto"),
  unidade: z.string().min(1, "Unidade obrigatória"),
  centroCusto: z.string().min(1, "Selecione o centro de custo"),
  centroCustoDescricao: z.string().min(1, "Selecione o centro de custo"),
  quantidade: z.coerce.number().min(1, "Quantidade mínima: 1"),
  observacao: z.string().trim().min(1, "Informe a observação"),
  dataEntrega: z
    .string()
    .min(1, "Informe a data de entrega")
    .refine((value) => brDateToIso(value) != null, "Data inválida. Use DD/MM/AAAA"),
});

type ItemDraftForm = z.infer<typeof itemDraftSchema>;

const emptyDraft = (dataEntregaIso = ""): ItemDraftForm => ({
  produto: "",
  produtoDescricao: "",
  unidade: "UN",
  centroCusto: "",
  centroCustoDescricao: "",
  quantidade: 1,
  observacao: "",
  dataEntrega: isoToBrDate(dataEntregaIso),
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

  const filialSelected = Boolean(filial);
  const isSubmitting = incluiMutation.isPending;
  const defaultDataEntregaBr = tipoCompra ? isoToBrDate(getDefaultDataEntrega(tipoCompra)) : "";
  const numeroScLabel = alterRequest ? formatNumeroSc(alterRequest.numero) : "";

  React.useEffect(() => {
    const draftState: SolicitacaoDraftState = {
      produto: draft.produto ?? "",
      centroCusto: draft.centroCusto ?? "",
      quantidade: draft.quantidade ?? 1,
      observacao: draft.observacao,
      dataEntrega: draft.dataEntrega,
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

    const parsed = itemDraftSchema.safeParse(draft);
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
      item: current?.item,
      produto: parsedItem.produto ?? "",
      produtoDescricao: parsedItem.produtoDescricao ?? "",
      unidade: parsedItem.unidade ?? "UN",
      centroCusto: parsedItem.centroCusto ?? "",
      centroCustoDescricao: parsedItem.centroCustoDescricao ?? "",
      quantidade: parsedItem.quantidade ?? 1,
      observacao: parsedItem.observacao,
      dataEntrega: dataEntregaIso,
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
      dataEntrega: isoToBrDate(item.dataEntrega),
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
            <CentroCustoCombobox
              value={draft.centroCusto}
              selectedLabel={
                draft.centroCusto
                  ? `${draft.centroCusto} - ${draft.centroCustoDescricao}`
                  : undefined
              }
              onValueChange={(custo, option) => {
                updateDraft("centroCusto", custo);
                if (option) {
                  updateDraft("centroCustoDescricao", option.descricao);
                }
              }}
              disabled={!filialSelected}
              error={draftErrors.centroCusto}
            />
          </FormGridItem>

          <FormField label="Quantidade" htmlFor="quantidade" required error={draftErrors.quantidade}>
            <Input
              id="quantidade"
              type="number"
              min={1}
              value={draft.quantidade}
              disabled={!filialSelected}
              onChange={(e) => updateDraft("quantidade", Number(e.target.value))}
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
    </form>
  );
};

export default SolicitacaoForm;
