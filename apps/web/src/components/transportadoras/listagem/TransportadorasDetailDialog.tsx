import React from "react";
import type { TransportadoraDetalhe } from "@gestao-compra/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@gestao-compra/ui";
import TransportadorasDetailContent from "./TransportadorasDetailContent";

interface TransportadorasDetailDialogProps {
  transportadora: TransportadoraDetalhe | null;
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransportadorasDetailDialog: React.FC<TransportadorasDetailDialogProps> = ({
  transportadora,
  open,
  loading,
  onOpenChange,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
      <DialogHeader className="sr-only">
        <DialogTitle>Detalhe da transportadora</DialogTitle>
      </DialogHeader>
      {transportadora ? (
        <TransportadorasDetailContent
          transportadora={transportadora}
          loading={loading}
          onBack={() => onOpenChange(false)}
        />
      ) : null}
    </DialogContent>
  </Dialog>
);

export default TransportadorasDetailDialog;
