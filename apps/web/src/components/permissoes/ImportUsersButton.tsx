import React from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@gestao-compra/ui";
import { toast } from "sonner";
import { useImportUsers } from "@/hooks/usePermissions";

const ImportUsersButton: React.FC = () => {
  const importUsers = useImportUsers();

  const handleImport = async () => {
    try {
      const result = await importUsers.mutateAsync();
      toast.success(
        `Importação concluída: ${result.imported} novo(s), ${result.skipped} já existente(s).`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao importar usuários do Protheus",
      );
    }
  };

  return (
    <Button onClick={handleImport} disabled={importUsers.isPending}>
      {importUsers.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Importar usuários do Protheus
    </Button>
  );
};

export default ImportUsersButton;
