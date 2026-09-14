import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@gestao-compra/ui";
import {
  ACAO_ALTERA_TRANSPORTADORA,
  ACAO_INCLUI_TRANSPORTADORA,
  emptyTransportadoraFormDraft,
  mapDetalheToTransportadoraDraft,
  mapFormToIncluiTransportadoraPayload,
  municipioOptionKey,
  municipioOptionLabel,
  validateTransportadoraForm,
  type TipoAntt,
  type TransportadoraFormDraft,
  type TransportadoraFormErrors,
  type ViaTransporte,
} from "@gestao-compra/shared";
import FormField from "@/components/inclusao/FormField";
import FormSection from "@/components/inclusao/FormSection";
import { FormGrid, FormGridItem } from "@/components/inclusao/FormGrid";
import { useIncluiTransportadora } from "@/hooks/useIncluiTransportadora";
import { useTransportadoraLeave } from "./TransportadoraLeaveContext";
import ViaTransporteSelect from "./ViaTransporteSelect";
import TipoAnttSelect from "./TipoAnttSelect";
import MunicipioCombobox from "./MunicipioCombobox";
import type { TransportadoraFormLocationState } from "./transportadoraFormState";

const TransportadoraInclusaoForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsDirty, confirmLeave } = useTransportadoraLeave();
  const incluiMutation = useIncluiTransportadora();
  const [alterFrom] = React.useState(
    () => (location.state as TransportadoraFormLocationState | null)?.alterFrom,
  );
  const isAlter = Boolean(alterFrom?.codigo);
  const [initialDraft] = React.useState<TransportadoraFormDraft>(() =>
    alterFrom ? mapDetalheToTransportadoraDraft(alterFrom) : emptyTransportadoraFormDraft(),
  );
  const [draft, setDraft] = React.useState<TransportadoraFormDraft>(initialDraft);
  const [errors, setErrors] = React.useState<TransportadoraFormErrors>({});
  const isSubmitting = incluiMutation.isPending;

  React.useEffect(() => {
    if (isAlter) {
      setIsDirty(JSON.stringify(draft) !== JSON.stringify(initialDraft));
      return;
    }
    const dirty = Object.entries(draft).some(([, value]) => Boolean(String(value).trim()));
    setIsDirty(dirty);
  }, [draft, initialDraft, isAlter, setIsDirty]);

  const updateDraft = <K extends keyof TransportadoraFormDraft>(
    key: K,
    value: TransportadoraFormDraft[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateTransportadoraForm(draft);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (isAlter && !draft.codigo.trim()) {
      toast.error("Código da transportadora inválido");
      return;
    }

    try {
      await incluiMutation.mutateAsync(
        mapFormToIncluiTransportadoraPayload(draft, {
          acao: isAlter ? ACAO_ALTERA_TRANSPORTADORA : ACAO_INCLUI_TRANSPORTADORA,
        }),
      );
      setIsDirty(false);
      navigate("/transportadoras");
    } catch {
      // toast já tratado no hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
      <FormSection title={isAlter ? `Alterar transportadora ${draft.codigo}` : "Dados da transportadora"}>
        <FormGrid>
          <FormField label="Código" htmlFor="codigo">
            <Input
              id="codigo"
              value={draft.codigo}
              disabled
              placeholder={isAlter ? undefined : "Gerado automaticamente"}
            />
          </FormField>

          <FormGridItem span={2}>
            <FormField label="Nome" htmlFor="nome" required error={errors.nome}>
              <Input
                id="nome"
                value={draft.nome}
                onChange={(e) => updateDraft("nome", e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>
          </FormGridItem>

          <FormField label="Nome reduzido" htmlFor="nomeReduzido">
            <Input
              id="nomeReduzido"
              value={draft.nomeReduzido}
              onChange={(e) => updateDraft("nomeReduzido", e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <ViaTransporteSelect
            value={draft.via}
            onValueChange={(value: ViaTransporte) => updateDraft("via", value)}
            disabled={isSubmitting}
            error={errors.via}
          />

          <FormField label="CPF/CNPJ" htmlFor="cgc" required error={errors.cgc}>
            <Input
              id="cgc"
              value={draft.cgc}
              onChange={(e) => updateDraft("cgc", e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <TipoAnttSelect
            value={draft.tipoAntt}
            onValueChange={(value: TipoAntt) => updateDraft("tipoAntt", value)}
            disabled={isSubmitting}
            error={errors.tipoAntt}
          />

          <FormField label="RNTRC" htmlFor="antt" required error={errors.antt}>
            <Input
              id="antt"
              value={draft.antt}
              onChange={(e) => updateDraft("antt", e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Inscrição estadual" htmlFor="inscEstadual">
            <Input
              id="inscEstadual"
              value={draft.inscEstadual}
              onChange={(e) => updateDraft("inscEstadual", e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Endereço">
        <FormGrid>
          <FormGridItem span="full">
            <FormField label="Endereço" htmlFor="endereco">
              <Input
                id="endereco"
                value={draft.endereco}
                onChange={(e) => updateDraft("endereco", e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>
          </FormGridItem>

          <FormField label="Bairro" htmlFor="bairro">
            <Input
              id="bairro"
              value={draft.bairro}
              onChange={(e) => updateDraft("bairro", e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <MunicipioCombobox
            value={
              draft.codMunicipio && draft.estado
                ? municipioOptionKey({
                    codMun: draft.codMunicipio,
                    estado: draft.estado,
                  })
                : ""
            }
            selectedLabel={
              draft.municipio
                ? municipioOptionLabel({
                    municipio: draft.municipio,
                    estado: draft.estado,
                  })
                : undefined
            }
            onValueChange={(option) => {
              setDraft((prev) => ({
                ...prev,
                municipio: option?.municipio ?? "",
                codMunicipio: option?.codMun ?? "",
                estado: option?.estado ?? "",
              }));
              setErrors((prev) => {
                if (!prev.municipio && !prev.codMunicipio && !prev.estado) return prev;
                const next = { ...prev };
                delete next.municipio;
                delete next.codMunicipio;
                delete next.estado;
                return next;
              });
            }}
            disabled={isSubmitting}
            error={errors.municipio}
          />

          <FormField label="Cód. Município" htmlFor="codMunicipio">
            <Input id="codMunicipio" value={draft.codMunicipio} disabled />
          </FormField>

          <FormField label="Estado" htmlFor="estado">
            <Input id="estado" value={draft.estado} disabled />
          </FormField>

          <FormField label="CEP" htmlFor="cep">
            <Input
              id="cep"
              value={draft.cep}
              onChange={(e) => updateDraft("cep", e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Contato">
        <FormGrid>
          <FormField label="DDD" htmlFor="ddd">
            <Input
              id="ddd"
              value={draft.ddd}
              onChange={(e) => updateDraft("ddd", e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Telefone" htmlFor="telefone">
            <Input
              id="telefone"
              value={draft.telefone}
              onChange={(e) => updateDraft("telefone", e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormGridItem span={2}>
            <FormField label="E-mail" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={draft.email}
                onChange={(e) => updateDraft("email", e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>
          </FormGridItem>
        </FormGrid>
      </FormSection>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
          onClick={() => confirmLeave(() => navigate("/transportadoras"))}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : isAlter ? (
            "Salvar alteração"
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
    </form>
  );
};

export default TransportadoraInclusaoForm;
