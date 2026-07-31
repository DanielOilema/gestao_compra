import React, { useCallback, useRef } from "react";
import { Button } from "@gestao-compra/ui";
import { Paperclip, Upload, X } from "lucide-react";

interface AttachmentUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  files,
  onChange,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = useCallback(
    (selected: FileList | null) => {
      if (!selected?.length) return;
      onChange([...files, ...Array.from(selected)]);
    },
    [files, onChange],
  );

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!disabled) handleSelect(e.dataTransfer.files);
        }}
      >
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Anexar documentos</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Arraste arquivos ou clique para selecionar. Integração com ERP em desenvolvimento.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="mr-2 h-4 w-4" />
          Selecionar arquivos
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleSelect(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
            >
              <span className="truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => removeFile(index)}
                aria-label={`Remover ${file.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttachmentUpload;
