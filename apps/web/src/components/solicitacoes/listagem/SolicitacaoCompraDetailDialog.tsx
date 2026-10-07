import React, { useState } from "react";
import type { PurchaseRequest } from "@gestao-compra/shared";
import { Button, Dialog, DialogContent } from "@gestao-compra/ui";
import { Loader2 } from "lucide-react";
import RastroSolicitacaoPanel from "@/components/solicitacoes/rastro/RastroSolicitacaoPanel";
import SolicitacaoCompraDetailContent from "./SolicitacaoCompraDetailContent";

interface SolicitacaoCompraDetailDialogProps {
  request: PurchaseRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showActions?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const SolicitacaoCompraDetailDialog: React.FC<SolicitacaoCompraDetailDialogProps> = ({
  request,
  open,
  onOpenChange,
  showActions = true,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const [view, setView] = useState<"detalhe" | "rastro">("detalhe");
  const requestKey = request ? `${request.filial}|${request.numero}` : "";
  const [viewKey, setViewKey] = useState(requestKey);

  if (requestKey !== viewKey) {
    setViewKey(requestKey);
    setView("detalhe");
  }

  if (!request && !isLoading && !error) return null;

  const mostrarRastro = view === "rastro" && !!request && !isLoading && !error;

  const handleOpenChange = (next: boolean) => {
    if (!next) setView("detalhe");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={
          mostrarRastro
            ? "max-h-[90vh] max-w-6xl overflow-y-auto p-4 sm:p-6"
            : "max-h-[90vh] max-w-4xl overflow-y-auto p-4 sm:p-6"
        }
      >
        {isLoading ? (
          <p role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando detalhes da solicitação.
          </p>
        ) : error ? (
          <div className="space-y-3 py-8 text-center">
            <p className="text-sm font-medium text-foreground">Não foi possível carregar os detalhes.</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            {onRetry ? (
              <Button type="button" onClick={onRetry}>
                Tentar novamente
              </Button>
            ) : null}
          </div>
        ) : request && mostrarRastro ? (
          <RastroSolicitacaoPanel
            filial={request.filial}
            numero={request.numero}
            onBack={() => setView("detalhe")}
          />
        ) : request ? (
          <SolicitacaoCompraDetailContent
            request={request}
            showActions={showActions}
            onBack={() => onOpenChange(false)}
            onRastrear={() => setView("rastro")}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default SolicitacaoCompraDetailDialog;
