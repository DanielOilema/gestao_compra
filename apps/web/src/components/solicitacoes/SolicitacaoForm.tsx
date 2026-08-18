import React from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Input,
  Textarea,
} from "@gestao-compra/ui";
import {
  getDefaultDataEntrega,
  mapFormToIncluiSCPayload,
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
import { isSolicitacaoFormDirty } from "./inclusao/solicitacaoFormDirty";
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
  observacao: z.string().optional(),
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

const SolicitacaoForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setIsDirty, confirmLeave } = useSolicitacaoLeave();
  const incluiMutation = useIncluiSolicitacao();
  const [filial, setFilial] = React.useState("");
  const [filialError, setFilialError] = React.useState<string>();
  const [tipoCompra, setTipoCompra] = React.useState<TipoCompra | "">("");
  const [tipoCompraError, setTipoCompraError] = React.useState<string>();
  const [draft, setDraft] = React.useState<ItemDraftForm>(emptyDraft());
  const [draftErrors, setDraftErrors] = React.useState<Partial<Record<keyof ItemDraftForm, string>>>({});
  const [itens, setItens] = React.useState<SolicitacaoItemDraft[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const filialSelected = Boolean(filial);
  const isSubmitting = incluiMutation.isPending;

  React.useEffect(() => {
    setIsDirty(isSolicitacaoFormDirty(filial, tipoCompra, itens, draft));
  }, [filial, tipoCompra, itens, draft, setIsDirty]);

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

    const item: SolicitacaoItemDraft = {
      id: editingId ?? createItemId(),
      ...parsed.data,
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

    const formPayload: SolicitacaoFormPayload = {
      filial,
      tipoCompra,
      itens: itens.map(({ id: _id, ...item }) => item),
    };

    const apiPayload = mapFormToIncluiSCPayload(formPayload, solicitante);

    try {
      await incluiMutation.mutateAsync(apiPayload);
      setIsDirty(false);
      navigate("/solicitacoes-compra");
    } catch {
      // toast já tratado no hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Dados da solicitação</h2>
        <FormGrid>
          <FilialSelect
            value={filial}
            onValueChange={(value) => {
              setFilial(value);
              setFilialError(undefined);
            }}
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
            <FormField label="Observações" htmlFor="observacao">
              <Textarea
                id="observacao"
                placeholder="Observações do item (opcional)"
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
              Incluindo...
            </>
          ) : (
            "Incluir"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SolicitacaoForm;
