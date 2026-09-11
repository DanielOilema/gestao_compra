import React from "react";
import {
  getPeriodoFilterKeys,
  type ReportFilterDef,
} from "@gestao-compra/shared";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gestao-compra/ui";
import { Loader2, Search } from "lucide-react";
import BrDateInput from "@/components/shared/BrDateInput";
import type { ReportFilterLookup } from "@/hooks/useReportLookups";

interface RelatorioFilterBarProps {
  filtros: ReportFilterDef[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onConsultar: () => void;
  isLoading?: boolean;
  lookups?: Record<string, ReportFilterLookup>;
}

const fieldLabel = (label: string, obrigatorio?: boolean) => (
  <>
    {label}
    {obrigatorio ? " *" : ""}
  </>
);

const RelatorioFilterBar: React.FC<RelatorioFilterBarProps> = ({
  filtros,
  values,
  onChange,
  onConsultar,
  isLoading = false,
  lookups = {},
}) => {
  const update = (key: string, value: string) => {
    onChange({ ...values, [key]: value });
  };

  const missingRequiredSelect = filtros.some(
    (filtro) => filtro.obrigatorio && filtro.tipo === "selecao" && !values[filtro.key]?.trim(),
  );
  const lookupBlocking = filtros.some((filtro) => {
    if (!filtro.fonteOpcoes) return false;
    const lookup = lookups[filtro.fonteOpcoes];
    return Boolean(lookup?.isLoading || lookup?.error);
  });
  const consultarDisabled = isLoading || missingRequiredSelect || lookupBlocking;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!consultarDisabled) onConsultar();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtros.map((filtro) => {
          if (filtro.tipo === "periodo") {
            const { inicial, final } = getPeriodoFilterKeys(filtro.key);
            return (
              <React.Fragment key={filtro.key}>
                <div className="space-y-2">
                  <Label htmlFor={`filtro-${inicial}`}>{fieldLabel("Data inicial", filtro.obrigatorio)}</Label>
                  <BrDateInput
                    id={`filtro-${inicial}`}
                    value={values[inicial] ?? ""}
                    onChange={(value) => update(inicial, value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`filtro-${final}`}>{fieldLabel("Data final", filtro.obrigatorio)}</Label>
                  <BrDateInput
                    id={`filtro-${final}`}
                    value={values[final] ?? ""}
                    onChange={(value) => update(final, value)}
                  />
                </div>
              </React.Fragment>
            );
          }

          if (filtro.tipo === "selecao") {
            const lookup = filtro.fonteOpcoes ? lookups[filtro.fonteOpcoes] : undefined;
            const options = lookup?.options ?? filtro.opcoes ?? [];
            const selectId = `filtro-${filtro.key}`;

            return (
              <div key={filtro.key} className="space-y-2">
                <Label htmlFor={selectId}>{fieldLabel(filtro.label, filtro.obrigatorio)}</Label>
                <Select
                  value={values[filtro.key] || undefined}
                  onValueChange={(value) => update(filtro.key, value)}
                  disabled={lookup?.isLoading}
                >
                  <SelectTrigger id={selectId}>
                    {lookup?.isLoading ? (
                      <span className="flex items-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Carregando...
                      </span>
                    ) : (
                      <SelectValue placeholder={filtro.placeholder ?? "Selecione"} />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.valor} value={option.valor}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {lookup?.error ? (
                  <p className="text-sm text-destructive">{lookup.error}</p>
                ) : null}
              </div>
            );
          }

          if (filtro.tipo === "data") {
            return (
              <div key={filtro.key} className="space-y-2">
                <Label htmlFor={`filtro-${filtro.key}`}>{fieldLabel(filtro.label, filtro.obrigatorio)}</Label>
                <BrDateInput
                  id={`filtro-${filtro.key}`}
                  value={values[filtro.key] ?? ""}
                  onChange={(value) => update(filtro.key, value)}
                />
              </div>
            );
          }

          return (
            <div key={filtro.key} className="space-y-2">
              <Label htmlFor={`filtro-${filtro.key}`}>{fieldLabel(filtro.label, filtro.obrigatorio)}</Label>
              <Input
                id={`filtro-${filtro.key}`}
                value={values[filtro.key] ?? ""}
                onChange={(event) => update(filtro.key, event.target.value)}
                placeholder={filtro.placeholder}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={consultarDisabled}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Consultar
        </Button>
      </div>
    </form>
  );
};

export default RelatorioFilterBar;
