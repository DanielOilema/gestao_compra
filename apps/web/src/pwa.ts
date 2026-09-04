import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";
import { captureInstallPromptEarly } from "./lib/pwa-install";

export function registerPWA() {
  captureInstallPromptEarly();

  const updateSW = registerSW({
    onNeedRefresh() {
      toast("Nova versão disponível", {
        description: "Atualize para obter as mudanças mais recentes.",
        action: {
          label: "Atualizar",
          onClick: () => updateSW(true),
        },
        duration: Infinity,
      });
    },
    onOfflineReady() {
      toast.success("App pronto para uso", {
        description: "Recursos estáticos disponíveis offline.",
      });
    },
  });
}
