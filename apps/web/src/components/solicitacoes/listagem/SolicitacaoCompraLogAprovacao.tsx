import React from "react";
import type { LogAprovacaoEntry } from "@gestao-compra/shared";
import {
  Badge,
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
import { ClipboardCheck, Loader2 } from "lucide-react";
import { useLogAprovacao } from "@/hooks/useLogAprovacao";

interface SolicitacaoCompraLogAprovacaoProps {
  filial: string;
  numDoc: string;
}

const statusClassName = (status: string): string => {
  const value = status.trim().toLowerCase();
  if (value.includes("pend")) return "border-amber-500 text-amber-700";
  if (value.includes("aprov")) return "border-green-600 text-green-700";
  if (value.includes("rej") || value.includes("reprov") || value.includes("bloq")) {
    return "border-red-500 text-red-700";
  }
  return "text-foreground";
};

const LogStatus: React.FC<{ status: string }> = ({ status }) => {
  if (!status) return <span className="text-muted-foreground">-</span>;
  return (
    <Badge variant="outline" className={statusClassName(status)}>
      {status}
    </Badge>
  );
};

const LogRows: React.FC<{ entries: LogAprovacaoEntry[] }> = ({ entries }) => (
  <>
    <div className="space-y-3 sm:hidden">
      {entries.map((entry, index) => (
        <div
          key={`${entry.usuario}-${entry.nivel}-${entry.status}-${index}`}
          className="bg-muted/50 rounded-lg p-3 space-y-2"
        >
          <div>
            <p className="text-xs text-muted-foreground">Usuário</p>
            <p className="font-medium text-sm text-foreground">{entry.usuario || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <LogStatus status={entry.status} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nível</p>
            <p className="font-medium text-sm">{entry.nivel || "-"}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="hidden sm:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Nível</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={`${entry.usuario}-${entry.nivel}-${entry.status}-${index}`}>
              <TableCell className="font-medium text-foreground">{entry.usuario || "-"}</TableCell>
              <TableCell>
                <LogStatus status={entry.status} />
              </TableCell>
              <TableCell>{entry.nivel || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </>
);

const SolicitacaoCompraLogAprovacao: React.FC<SolicitacaoCompraLogAprovacaoProps> = ({
  filial,
  numDoc,
}) => {
  const { data, isLoading, isError, error } = useLogAprovacao(filial, numDoc);
  const entries = data ?? [];
  const errorMessage =
    error instanceof Error && error.message.trim()
      ? error.message
      : "Falha ao buscar o log de aprovação";

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          Log de aprovação{!isLoading && !isError ? ` (${entries.length})` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        {isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando log de aprovação...
          </p>
        ) : isError ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum registro no log de aprovação.</p>
        ) : (
          <LogRows entries={entries} />
        )}
      </CardContent>
    </Card>
  );
};

export default SolicitacaoCompraLogAprovacao;
