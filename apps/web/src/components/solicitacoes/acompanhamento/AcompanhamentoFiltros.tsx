import React from "react";
import type { TipoCompra } from "@gestao-compra/shared";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gestao-compra/ui";

const FILTRO_TODOS = "todos";

const COMPRADORES = [
  "elza.stasinafo",
  "niedson.nascimento",
  "danilo.sampaio",
  "fernando.passos",
  "A definir",
] as const;

const TIPOS_COMPRA: { value: TipoCompra; label: string }[] = [
  { value: "1", label: "Normal" },
  { value: "3", label: "Imediato/Direto" },
  { value: "4", label: "Regulariza" },
  { value: "2", label: "Urgente" },
];

interface AcompanhamentoFiltrosProps {
  numero: string;
  solicitante: string;
  comprador: string;
  tipoCompra: TipoCompra | "";
  disabled?: boolean;
  onNumeroChange: (value: string) => void;
  onSolicitanteChange: (value: string) => void;
  onCompradorChange: (value: string) => void;
  onTipoCompraChange: (value: TipoCompra | "") => void;
}

const AcompanhamentoFiltros: React.FC<AcompanhamentoFiltrosProps> = ({
  numero,
  solicitante,
  comprador,
  tipoCompra,
  disabled = false,
  onNumeroChange,
  onSolicitanteChange,
  onCompradorChange,
  onTipoCompraChange,
}) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <div className="space-y-1.5">
      <Label htmlFor="filtro-acompanhamento-numero">Número</Label>
      <Input
        id="filtro-acompanhamento-numero"
        value={numero}
        onChange={(event) => onNumeroChange(event.target.value)}
        placeholder="Número da solicitação"
        disabled={disabled}
      />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="filtro-acompanhamento-solicitante">Solicitante</Label>
      <Input
        id="filtro-acompanhamento-solicitante"
        value={solicitante}
        onChange={(event) => onSolicitanteChange(event.target.value)}
        placeholder="Nome do solicitante"
        disabled={disabled}
      />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="filtro-acompanhamento-comprador">Comprador</Label>
      <Select
        value={comprador || FILTRO_TODOS}
        onValueChange={(value) => onCompradorChange(value === FILTRO_TODOS ? "" : value)}
        disabled={disabled}
      >
        <SelectTrigger id="filtro-acompanhamento-comprador">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
          {COMPRADORES.map((nome) => (
            <SelectItem key={nome} value={nome}>
              {nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="filtro-acompanhamento-tipo">Tipo de compra</Label>
      <Select
        value={tipoCompra || FILTRO_TODOS}
        onValueChange={(value) =>
          onTipoCompraChange(value === FILTRO_TODOS ? "" : (value as TipoCompra))
        }
        disabled={disabled}
      >
        <SelectTrigger id="filtro-acompanhamento-tipo">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
          {TIPOS_COMPRA.map((tipo) => (
            <SelectItem key={tipo.value} value={tipo.value}>
              {tipo.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default AcompanhamentoFiltros;
