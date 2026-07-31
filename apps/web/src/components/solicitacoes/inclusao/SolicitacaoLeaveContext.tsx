import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@gestao-compra/ui";

type LeaveAction = () => void;

interface SolicitacaoLeaveContextValue {
  setIsDirty: (dirty: boolean) => void;
  confirmLeave: (action: LeaveAction) => void;
}

const SolicitacaoLeaveContext = React.createContext<SolicitacaoLeaveContextValue | null>(null);

export const SolicitacaoLeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDirty, setIsDirty] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const pendingActionRef = React.useRef<LeaveAction | null>(null);

  const confirmLeave = React.useCallback(
    (action: LeaveAction) => {
      if (!isDirty) {
        action();
        return;
      }
      pendingActionRef.current = action;
      setOpen(true);
    },
    [isDirty],
  );

  const handleConfirm = () => {
    setOpen(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) pendingActionRef.current = null;
  };

  return (
    <SolicitacaoLeaveContext.Provider value={{ setIsDirty, confirmLeave }}>
      {children}
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar solicitação?</AlertDialogTitle>
            <AlertDialogDescription>
              Você já começou a preencher esta solicitação. Se sair agora, os dados informados serão
              perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar preenchendo</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Sair sem salvar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SolicitacaoLeaveContext.Provider>
  );
};

export const useSolicitacaoLeave = (): SolicitacaoLeaveContextValue => {
  const context = React.useContext(SolicitacaoLeaveContext);
  if (!context) {
    throw new Error("useSolicitacaoLeave deve ser usado dentro de SolicitacaoLeaveProvider");
  }
  return context;
};
