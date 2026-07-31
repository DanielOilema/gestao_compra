import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { NotaTipo } from "@gestao-compra/shared";
import {
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from "@gestao-compra/ui";
import { toast } from "sonner";
import AttachmentUpload from "@/components/shared/AttachmentUpload";
import NotaItemsTable, { type NotaItemForm } from "./NotaItemsTable";

const formSchema = z.object({
  tipo: z.enum(["debito", "credito"]),
  valor: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  descricao: z.string().min(1, "Descrição obrigatória"),
  referenciaPedido: z.string().optional(),
  referenciaFatura: z.string().optional(),
  data: z.string().min(1, "Data obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

const NotaForm: React.FC = () => {
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [items, setItems] = React.useState<NotaItemForm[]>([]);
  const [tipo, setTipo] = React.useState<NotaTipo>("debito");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      tipo: "debito",
      valor: 0,
      descricao: "",
      referenciaPedido: "",
      referenciaFatura: "",
      data: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = (data: FormValues) => {
    const parsed = formSchema.safeParse({ ...data, tipo });
    if (!parsed.success) {
      toast.error("Verifique os campos obrigatórios");
      return;
    }
    toast.info("Funcionalidade em desenvolvimento. A persistência será implementada em breve.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-3">
        <Label>Tipo *</Label>
        <RadioGroup value={tipo} onValueChange={(v) => setTipo(v as NotaTipo)} className="flex gap-6">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="debito" id="tipo-debito" />
            <Label htmlFor="tipo-debito" className="font-normal cursor-pointer">
              Débito
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="credito" id="tipo-credito" />
            <Label htmlFor="tipo-credito" className="font-normal cursor-pointer">
              Crédito
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Input id="valor" type="number" min={0} step="0.01" {...register("valor")} />
          {errors.valor && <p className="text-sm text-destructive">{errors.valor.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="data">Data *</Label>
          <Input id="data" type="date" {...register("data")} />
          {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea id="descricao" placeholder="Descreva o motivo da nota..." {...register("descricao")} />
        {errors.descricao && <p className="text-sm text-destructive">{errors.descricao.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="referenciaPedido">Referência pedido de compra</Label>
          <Input id="referenciaPedido" placeholder="Ex: PC-2026-0089" {...register("referenciaPedido")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="referenciaFatura">Referência fatura</Label>
          <Input id="referenciaFatura" placeholder="Ex: NF-2026-3345" {...register("referenciaFatura")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Itens</Label>
        <NotaItemsTable items={items} onChange={setItems} />
      </div>

      <div className="space-y-2">
        <Label>Anexos comprobatórios</Label>
        <AttachmentUpload files={attachments} onChange={setAttachments} />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Salvar nota</Button>
      </div>
    </form>
  );
};

export default NotaForm;
