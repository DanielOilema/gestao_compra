import React, { useCallback, useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@gestao-compra/ui";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { cn } from "@gestao-compra/ui";
import { toast } from "sonner";
import type { ExportPayload } from "@/lib/export/types";

type ExportFormat = "xlsx" | "pdf";

interface ExportMenuProps {
  /**
   * Resolvido no momento do clique para que a exportação use os dados correntes e, quando o
   * relatório for paginado, possa buscar o conjunto completo.
   */
  getPayload: () => ExportPayload | Promise<ExportPayload>;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const ExportMenu: React.FC<ExportMenuProps> = ({
  getPayload,
  disabled = false,
  label = "Exportar",
  className,
}) => {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      setExporting(format);

      try {
        const payload = await getPayload();

        if (payload.linhas.length === 0) {
          toast.info("Não há dados para exportar.");
          return;
        }

        // Import dinâmico: exceljs e pdfmake ficam fora do bundle inicial.
        if (format === "xlsx") {
          const { exportToXlsx } = await import("@/lib/export/toXlsx");
          await exportToXlsx(payload);
        } else {
          const { exportToPdf } = await import("@/lib/export/toPdf");
          await exportToPdf(payload);
        }

        toast.success(
          format === "xlsx" ? "Planilha gerada com sucesso" : "PDF gerado com sucesso",
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Falha ao exportar os dados.";
        toast.error(message);
      } finally {
        setExporting(null);
      }
    },
    [getPayload],
  );

  const isExporting = exporting !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn(className)} disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={isExporting}
          onSelect={(event) => {
            event.preventDefault();
            void handleExport("xlsx");
          }}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isExporting}
          onSelect={(event) => {
            event.preventDefault();
            void handleExport("pdf");
          }}
        >
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
