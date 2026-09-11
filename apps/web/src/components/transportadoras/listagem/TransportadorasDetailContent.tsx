import React from "react";
import {
  getTipoAnttLabel,
  getViaTransporteLabel,
  type TransportadoraDetalhe,
} from "@gestao-compra/shared";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@gestao-compra/ui";
import { ArrowLeft, Building2, MapPin, Phone, Truck } from "lucide-react";

interface TransportadorasDetailContentProps {
  transportadora: TransportadoraDetalhe;
  loading?: boolean;
  onBack: () => void;
}

const displayValue = (value?: string) => (value?.trim() ? value : "-");

const DetailLine: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <p>
    <span className="text-muted-foreground">{label}:</span>{" "}
    <span className="font-medium">{displayValue(value)}</span>
  </p>
);

const TransportadorasDetailContent: React.FC<TransportadorasDetailContentProps> = ({
  transportadora,
  loading,
  onBack,
}) => (
  <div className="animate-fade-in space-y-4 sm:space-y-6">
    <div className="flex items-center gap-3 sm:gap-4">
      <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="min-w-0 flex-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
          <Truck className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
          <span className="truncate">
            {transportadora.codigo} — {transportadora.nome || "Transportadora"}
          </span>
        </h2>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {displayValue(transportadora.cgc)}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <Card>
        <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pb-3 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Identificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-3 pb-3 text-sm sm:px-6 sm:pb-6">
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <DetailLine label="Código" value={transportadora.codigo} />
              <DetailLine label="Nome" value={transportadora.nome} />
              <DetailLine label="Nome reduzido" value={transportadora.nomeReduzido} />
              <DetailLine label="Via" value={getViaTransporteLabel(transportadora.via)} />
              <DetailLine label="CPF/CNPJ" value={transportadora.cgc} />
              <DetailLine label="Inscrição estadual" value={transportadora.inscEstadual} />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pb-3 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Truck className="h-4 w-4 text-primary" />
            ANTT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-3 pb-3 text-sm sm:px-6 sm:pb-6">
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <DetailLine label="Tipo ANTT" value={getTipoAnttLabel(transportadora.tipoAntt)} />
              <DetailLine label="RNTRC" value={transportadora.antt} />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pb-3 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-3 pb-3 text-sm sm:px-6 sm:pb-6">
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <DetailLine label="Endereço" value={transportadora.endereco} />
              <DetailLine label="Bairro" value={transportadora.bairro} />
              <DetailLine label="Município" value={transportadora.municipio} />
              <DetailLine label="Cód. município" value={transportadora.codMunicipio} />
              <DetailLine label="Estado" value={transportadora.estado} />
              <DetailLine label="CEP" value={transportadora.cep} />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pb-3 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Phone className="h-4 w-4 text-primary" />
            Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-3 pb-3 text-sm sm:px-6 sm:pb-6">
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <DetailLine
                label="Telefone"
                value={
                  transportadora.ddd || transportadora.telefone
                    ? `${transportadora.ddd ? `(${transportadora.ddd}) ` : ""}${transportadora.telefone}`
                    : ""
                }
              />
              <DetailLine label="E-mail" value={transportadora.email} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default TransportadorasDetailContent;
