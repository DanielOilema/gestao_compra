import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { REPORT_MODULE_LABELS } from "@gestao-compra/shared";
import { Card } from "@gestao-compra/ui";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { resolveReportIcon } from "@/components/relatorios/reportIcons";
import { getReportsByModule } from "@/config/reports";
import { useRelatoriosContext } from "./relatoriosContext";

const RelatoriosModulePage: React.FC = () => {
  const { modulo } = useRelatoriosContext();

  const reports = useMemo(() => getReportsByModule(modulo), [modulo]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Relatórios do ${REPORT_MODULE_LABELS[modulo]}`}
        description="Selecione um relatório para consultar indicadores e exportar os dados"
      />

      {reports.length === 0 ? (
        <Card className="max-w-2xl p-6">
          <p className="text-sm font-medium text-foreground">
            Nenhum relatório disponível neste módulo.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Os relatórios aparecem aqui conforme são publicados no Protheus.
          </p>
        </Card>
      ) : (
        <div className="grid max-w-4xl gap-3 sm:grid-cols-2">
          {reports.map((report) => {
            const Icon = resolveReportIcon(report.icone);

            return (
              <Link
                key={report.id}
                to={`/relatorios/${modulo}/${report.id}`}
                className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="flex h-full items-start gap-3 p-4 transition-colors hover:border-primary hover:bg-accent/40">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{report.titulo}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{report.descricao}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RelatoriosModulePage;
