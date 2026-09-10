import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { DebitCreditNote } from "@gestao-compra/shared";
import { getFormaPagamentoLabel } from "@gestao-compra/shared";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@gestao-compra/ui";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Info,
  Building2,
  Printer,
  Ban,
  Copy,
  CreditCard,
  Loader2,
  ScrollText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { printNotaDebCre, startNotaPrintSession } from "@/lib/printNotaDebCre";
import StatusBadge from "@/components/shared/StatusBadge";
import NotaDetailItensSection from "./NotaDetailItensSection";
import type { NovaNotaLocationState } from "@/components/notas/inclusao/copyNotaDebCre";


interface NotasDetailContentProps {
  nota: DebitCreditNote;
  loading?: boolean;
  onBack: () => void;
}

const formatDate = (date: string) => {
  if (!date) return "-";
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
};

const displayValue = (value?: string) => (value?.trim() ? value : "-");

const NotasDetailContent: React.FC<NotasDetailContentProps> = ({
  nota,
  loading,
  onBack,
}) => {
  const { protheusAuth } = useAuth();
  const navigate = useNavigate();
  const [printing, setPrinting] = React.useState(false);
  const cliForLabel = nota.tipo === "credito" ? "Cliente" : "Fornecedor";

  const handlePrint = () => {
    if (!protheusAuth) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    const session = startNotaPrintSession();
    setPrinting(true);

    void printNotaDebCre({ nota, basicAuth: protheusAuth, session })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Erro ao imprimir nota");
      })
      .finally(() => {
        setPrinting(false);
      });
  };

  const handleCopy = () => {
    const state: NovaNotaLocationState = { copyFrom: nota };
    navigate("/notas-debito-credito/nova", { state });
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">

      <div className="flex items-center gap-3 sm:gap-4">

        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">

          <ArrowLeft className="h-5 w-5" />

        </Button>

        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">

              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />

              <span className="truncate">

                Nota {nota.numero} — Filial {nota.filial}

              </span>

            </h2>

            <StatusBadge status={nota.tipo} />

          </div>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1">

            Nota de {nota.tipo === "credito" ? "Crédito" : "Débito"}

          </p>

        </div>

      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

        <Card>

          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">

            <CardTitle className="text-sm sm:text-base flex items-center gap-2">

              <Building2 className="h-4 w-4 text-primary" />

              {cliForLabel}

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6">

            {loading ? (

              <Skeleton className="h-10 w-full" />

            ) : (

              <>

                <p className="font-medium text-sm sm:text-base">

                  {nota.codigoCliFor}

                  {nota.lojaCliFor ? ` / ${nota.lojaCliFor}` : ""} — {nota.nomeCliFor || "-"}

                </p>

                <p className="text-xs text-muted-foreground">

                  {displayValue(nota.cnpj)}

                </p>

              </>

            )}

          </CardContent>

        </Card>



        <Card>

          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">

            <CardTitle className="text-sm sm:text-base flex items-center gap-2">

              <Info className="h-4 w-4 text-primary" />

              Informações

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6 text-sm">

            {loading ? (

              <Skeleton className="h-16 w-full" />

            ) : (

              <>

                <p>

                  <span className="text-muted-foreground">Usuário:</span>{" "}

                  <span className="font-medium">{displayValue(nota.responsavel)}</span>

                </p>

                <p>

                  <span className="text-muted-foreground">Setor:</span>{" "}

                  <span className="font-medium">{displayValue(nota.setor)}</span>

                </p>

                <p>

                  <span className="text-muted-foreground">Nº documento:</span>{" "}

                  <span className="font-medium">{displayValue(nota.numeroDoc)}</span>

                </p>

              </>

            )}

          </CardContent>

        </Card>



        <Card>

          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">

            <CardTitle className="text-sm sm:text-base flex items-center gap-2">

              <Calendar className="h-4 w-4 text-primary" />

              Datas

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6 text-sm">

            {loading ? (

              <Skeleton className="h-10 w-full" />

            ) : (

              <>

                <p>Emissão: {formatDate(nota.dataEmissao)}</p>

                <p>Vencimento: {formatDate(nota.dataVencimento)}</p>

              </>

            )}

          </CardContent>

        </Card>



        <Card>

          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">

            <CardTitle className="text-sm sm:text-base flex items-center gap-2">

              <CreditCard className="h-4 w-4 text-primary" />

              Pagamento

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6 text-sm">

            {loading ? (

              <Skeleton className="h-16 w-full" />

            ) : (

              <>

                <p>

                  Condição:{" "}

                  {nota.formaPagamento

                    ? getFormaPagamentoLabel(nota.formaPagamento)

                    : "-"}

                </p>

                <p>Banco: {displayValue(nota.banco)}</p>

                <p>Agência: {displayValue(nota.agencia)}</p>

                <p>Conta: {displayValue(nota.conta)}</p>

                <p>Recebedor: {displayValue(nota.nomeRecebedor)}</p>

                <p>CPF/CNPJ recebedor: {displayValue(nota.cpfCnpjRecebedor)}</p>

              </>

            )}

          </CardContent>

        </Card>



        <Card className="sm:col-span-2">

          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">

            <CardTitle className="text-sm sm:text-base flex items-center gap-2">

              <ScrollText className="h-4 w-4 text-primary" />

              Referente a

            </CardTitle>

          </CardHeader>

          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 text-sm">

            {loading ? (

              <Skeleton className="h-10 w-full" />

            ) : (

              <p className="font-medium whitespace-pre-wrap break-words">

                {displayValue(nota.referenteA)}

              </p>

            )}

          </CardContent>

        </Card>



        {nota.tipo === "credito" && (nota.natureza || nota.tes) ? (

          <Card className="sm:col-span-2">

            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">

              <CardTitle className="text-sm sm:text-base">Natureza e TES</CardTitle>

            </CardHeader>

            <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6 text-sm text-muted-foreground">

              <p>

                Natureza:{" "}

                {nota.natureza

                  ? `${nota.natureza}${nota.naturezaDescricao ? ` - ${nota.naturezaDescricao}` : ""}`

                  : "-"}

              </p>

              <p>

                TES:{" "}

                {nota.tes

                  ? `${nota.tes}${nota.tesDescricao ? ` - ${nota.tesDescricao}` : ""}`

                  : "-"}

              </p>

            </CardContent>

          </Card>

        ) : null}

      </div>



      <NotaDetailItensSection
        itens={nota.itens}
        valorTotal={nota.valorTotal}
        loading={loading}
      />



      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

        <Button
          size="sm"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={loading || printing}
          onClick={handlePrint}
        >
          {printing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Printer className="mr-2 h-4 w-4" />
          )}
          Imprimir
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={loading || printing}
          onClick={handleCopy}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copiar
        </Button>

        <Button

          size="sm"

          variant="outline"

          className="w-full sm:w-auto"

          onClick={() => toast.info("Cancelamento em desenvolvimento.")}

        >

          <Ban className="mr-2 h-4 w-4" />

          Cancelar

        </Button>

      </div>

    </div>

  );

};



export default NotasDetailContent;

