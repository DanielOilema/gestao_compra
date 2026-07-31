import React from "react";
import type { DebitCreditNote } from "@gestao-compra/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@gestao-compra/ui";
import NotasDetailContent from "./NotasDetailContent";

interface NotasDetailDialogProps {
  nota: DebitCreditNote | null;
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotasDetailDialog: React.FC<NotasDetailDialogProps> = ({
  nota,
  open,
  loading,
  onOpenChange,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader className="sr-only">
        <DialogTitle>Detalhe da nota</DialogTitle>
      </DialogHeader>
      {nota ? (
        <NotasDetailContent
          nota={nota}
          loading={loading}
          onBack={() => onOpenChange(false)}
        />
      ) : null}
    </DialogContent>
  </Dialog>
);

export default NotasDetailDialog;
