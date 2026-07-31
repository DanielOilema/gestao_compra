import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Textarea, Label } from '@gestao-compra/ui';
import { MessageSquare } from 'lucide-react';

interface OrderObservationFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const OrderObservationField: React.FC<OrderObservationFieldProps> = ({
  value,
  onChange,
  required = false,
  error,
  disabled,
}) => {
  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Observações
          {required && <span className="text-destructive">*</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-2">
        <Label htmlFor="order-observation" className="sr-only">
          Observações do pedido
        </Label>
        <Textarea
          id="order-observation"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            required
              ? 'Informe o motivo do bloqueio (obrigatório)'
              : 'Adicione observações sobre o pedido (opcional)'
          }
          disabled={disabled}
          aria-invalid={!!error}
          className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
          rows={4}
        />
        {error && <p className="text-xs sm:text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default OrderObservationField;
