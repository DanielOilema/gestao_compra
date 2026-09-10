import React from "react";
import type { PurchaseRequest } from "@gestao-compra/shared";
import { Dialog, DialogContent } from "@gestao-compra/ui";
import SolicitacaoCompraDetailContent from "./SolicitacaoCompraDetailContent";

interface SolicitacaoCompraDetailDialogProps {
  request: PurchaseRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlterar?: () => void;
}

const SolicitacaoCompraDetailDialog: React.FC<SolicitacaoCompraDetailDialogProps> = ({
  request,
  open,
  onOpenChange,
  onAlterar,
}) => {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <SolicitacaoCompraDetailContent
          request={request}
          onBack={() => onOpenChange(false)}
          onAlterar={onAlterar}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SolicitacaoCompraDetailDialog;
