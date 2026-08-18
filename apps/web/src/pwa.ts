import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";

export function registerPWA() {
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
