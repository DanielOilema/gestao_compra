import React, { useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gestao-compra/ui";
import { CheckCircle2, Download, Share, Smartphone } from "lucide-react";
import logobranca from "@/assets/logobranca.png";
import {
  isIosDevice,
  isInstallSkipped,
  isRestrictedInAppBrowser,
  isStandalone,
  promptPwaInstall,
  shouldForcePwaInstall,
  skipInstallPrompt,
  subscribeInstallPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";

const ESCAPE_DELAY_MS = 5000;

const PwaInstallGate: React.FC = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [skipped, setSkipped] = useState(() => isInstallSkipped());
  const [standalone, setStandalone] = useState(() => (typeof window === "undefined" ? false : isStandalone()));
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showEscape, setShowEscape] = useState(false);
  const [confirmEscape, setConfirmEscape] = useState(false);

  useEffect(() => {
    return subscribeInstallPrompt(setDeferred);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowEscape(true), ESCAPE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const syncStandalone = () => setStandalone(isStandalone());
    media.addEventListener("change", syncStandalone);
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      media.removeEventListener("change", syncStandalone);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (skipped || standalone || !shouldForcePwaInstall()) {
    return null;
  }

  const ios = isIosDevice();
  const inAppBrowser = isRestrictedInAppBrowser();

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const outcome = await promptPwaInstall();
      if (outcome === "accepted") {
        setInstalled(true);
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleSkip = () => {
    skipInstallPrompt();
    setSkipped(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F8F9F9] p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6 flex flex-col items-center">
          <img
            src={logobranca}
            alt="Oilema - Sementes para o novo campo"
            className="h-16 w-auto max-w-[280px] object-contain sm:h-20"
          />
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-2 pb-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {installed ? <CheckCircle2 className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
            </div>
            <CardTitle className="text-xl">
              {installed ? "Aplicativo instalado" : "Instalar aplicativo"}
            </CardTitle>
            <CardDescription>
              {installed
                ? "Feche esta aba e abra o ícone Protheus na tela inicial."
                : "No celular, o Protheus Connect precisa ser instalado para continuar."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {installed ? (
              <p className="text-center text-sm text-muted-foreground">
                Depois de abrir pela tela inicial, faça login normalmente.
              </p>
            ) : inAppBrowser ? (
              <div className="rounded-md border border-input bg-background px-3 py-3 text-sm">
                Este navegador interno não instala aplicativos. Abra o link no{" "}
                <strong>{ios ? "Safari" : "Chrome"}</strong> e instale a partir de lá.
              </div>
            ) : ios ? (
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3 rounded-md border border-input bg-background px-3 py-2">
                  <span className="mt-0.5 font-semibold text-primary">1</span>
                  <span>
                    Toque em <Share className="mx-0.5 inline h-4 w-4" /> <strong>Compartilhar</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3 rounded-md border border-input bg-background px-3 py-2">
                  <span className="mt-0.5 font-semibold text-primary">2</span>
                  <span>
                    Toque em <strong>Adicionar à Tela de Início</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3 rounded-md border border-input bg-background px-3 py-2">
                  <span className="mt-0.5 font-semibold text-primary">3</span>
                  <span>
                    Confirme em <strong>Adicionar</strong> e abra o ícone Protheus
                  </span>
                </li>
              </ol>
            ) : (
              <>
                {deferred ? (
                  <Button
                    type="button"
                    className="h-11 w-full text-base font-medium"
                    disabled={installing}
                    onClick={() => void handleInstall()}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {installing ? "Instalando..." : "Instalar aplicativo"}
                  </Button>
                ) : (
                  <div className="rounded-md border border-input bg-background px-3 py-3 text-sm text-muted-foreground">
                    Use o menu do Chrome (<strong>⋮</strong>) e toque em{" "}
                    <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.
                  </div>
                )}
              </>
            )}

            {showEscape && !installed && (
              <div className="pt-1 text-center">
                {confirmEscape ? (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                    onClick={handleSkip}
                  >
                    Continuar no navegador
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                    onClick={() => setConfirmEscape(true)}
                  >
                    Não consigo instalar
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PwaInstallGate;
