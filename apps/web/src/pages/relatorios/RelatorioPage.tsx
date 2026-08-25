import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card } from "@gestao-compra/ui";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { findReportDefinition } from "@/config/reports";
import { useRelatoriosContext } from "./relatoriosContext";

/**
 * Renderizador genérico: qualquer relatório do catálogo é desenhado por esta página, a partir do
 * envelope devolvido pelo Protheus. Nenhuma regra de domínio pode entrar aqui.
 */
const RelatorioPage: React.FC = () => {
  const { modulo } = useRelatoriosContext();
  const { reportId } = useParams();

  const definition = useMemo(() => {
    const found = reportId ? findReportDefinition(reportId) : undefined;
    // Um relatório só é acessível pela URL do próprio módulo: o guard do layout validou a
    // permissão do módulo da URL, então aceitar um relatório de outro módulo aqui seria um
    // desvio de permissão.
    return found?.modulo === modulo ? found : undefined;
  }, [reportId, modulo]);

  const voltar = (
    <Button variant="outline" size="sm" asChild>
      <Link to={`/relatorios/${modulo}`}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Relatórios
      </Link>
    </Button>
  );

  if (!definition) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Relatório não encontrado" actions={voltar} />
        <Card className="max-w-2xl p-6">
          <p className="text-sm font-medium text-foreground">
            Este relatório não está disponível.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ele pode ter sido removido do catálogo ou pertencer a outro módulo.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={definition.titulo}
        description={definition.descricao}
        actions={voltar}
      />
      <Card className="max-w-2xl p-6">
        <p className="text-sm font-medium text-foreground">
          Visualização em implantação.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Os filtros, indicadores, gráficos e a tabela deste relatório são exibidos aqui quando a
          integração com o Protheus for concluída.
        </p>
      </Card>
    </div>
  );
};

export default RelatorioPage;
