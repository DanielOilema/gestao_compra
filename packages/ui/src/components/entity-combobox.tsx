import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface EntityComboboxProps<T> {
  value: string;
  onValueChange: (value: string, option?: T) => void;
  options: T[];
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  selectedLabel?: string;
  onSearchChange?: (search: string) => void;
  className?: string;
  id?: string;
}

export function EntityCombobox<T>({
  value,
  onValueChange,
  options,
  getLabel,
  getValue,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
  loading = false,
  disabled = false,
  selectedLabel,
  onSearchChange,
  className,
  id,
}: EntityComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedOption = React.useMemo(
    () => options.find((option) => getValue(option) === value),
    [options, value, getValue],
  );

  const displayLabel = selectedLabel || (selectedOption ? getLabel(selectedOption) : "");

  const handleSearchChange = (next: string) => {
    setSearch(next);
    onSearchChange?.(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", !displayLabel && "text-muted-foreground", className)}
        >
          <span className="truncate">{displayLabel || placeholder}</span>
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={!onSearchChange}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const optionValue = getValue(option);
                    return (
                      <CommandItem
                        key={optionValue}
                        value={`${optionValue} ${getLabel(option)}`}
                        onSelect={() => {
                          onValueChange(optionValue, option);
                          setOpen(false);
                          setSearch("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === optionValue ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="truncate">{getLabel(option)}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
