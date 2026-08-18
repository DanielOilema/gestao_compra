import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from "@gestao-compra/ui";
import type { AppUser } from "@gestao-compra/shared";

interface UserSearchSelectProps {
  users: AppUser[];
  value: string | null;
  onChange: (userId: string) => void;
}

const UserSearchSelect: React.FC<UserSearchSelectProps> = ({ users, value, onChange }) => {
  const [open, setOpen] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === value) ?? null,
    [users, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between sm:w-[360px]"
        >
          {selectedUser
            ? `${selectedUser.displayName} (${selectedUser.userName})`
            : "Selecione um usuário..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar usuário..." />
          <CommandList>
            <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.displayName} ${user.userName}`}
                  onSelect={() => {
                    onChange(user.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{user.displayName}</span>
                    <span className="text-xs text-muted-foreground">{user.userName}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UserSearchSelect;
