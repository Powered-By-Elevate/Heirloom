"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tag } from "@/lib/types";

export interface TagPickerSelection {
  selectedExistingIds: string[];
  newNames: string[];
}

interface TagPickerProps {
  label: string;
  helpText?: string;
  existingTags: Tag[];
  value: TagPickerSelection;
  onChange: (next: TagPickerSelection) => void;
}

export function TagPicker({
  label,
  helpText,
  existingTags,
  value,
  onChange,
}: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedExistingTags = existingTags.filter((t) =>
    value.selectedExistingIds.includes(t.id),
  );
  const totalSelected =
    selectedExistingTags.length + value.newNames.length;

  function toggleExisting(id: string) {
    const next = value.selectedExistingIds.includes(id)
      ? value.selectedExistingIds.filter((x) => x !== id)
      : [...value.selectedExistingIds, id];
    onChange({ ...value, selectedExistingIds: next });
  }

  function removeNew(name: string) {
    onChange({
      ...value,
      newNames: value.newNames.filter((n) => n !== name),
    });
  }

  function createFromQuery() {
    const name = query.trim();
    if (!name) return;

    const existing = existingTags.find(
      (t) => t.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      if (!value.selectedExistingIds.includes(existing.id)) {
        onChange({
          ...value,
          selectedExistingIds: [...value.selectedExistingIds, existing.id],
        });
      }
      setQuery("");
      return;
    }

    const alreadyNew = value.newNames.some(
      (n) => n.toLowerCase() === name.toLowerCase(),
    );
    if (!alreadyNew) {
      onChange({ ...value, newNames: [...value.newNames, name] });
    }
    setQuery("");
  }

  const trimmedQuery = query.trim();
  const exactExistingMatch = existingTags.some(
    (t) => t.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const exactNewMatch = value.newNames.some(
    (n) => n.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const showCreate =
    trimmedQuery.length > 0 && !exactExistingMatch && !exactNewMatch;

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {helpText ? (
          <span className="text-muted-foreground font-normal"> — {helpText}</span>
        ) : null}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal bg-card"
          >
            <span className={totalSelected > 0 ? "text-foreground" : "text-muted-foreground"}>
              {totalSelected > 0
                ? `${totalSelected} selected`
                : "Add or select…"}
            </span>
            <ChevronDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Search or type to create…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {existingTags.length === 0 && !showCreate ? (
                <CommandEmpty>
                  Type a name to create the first one.
                </CommandEmpty>
              ) : (
                <CommandEmpty>No matches.</CommandEmpty>
              )}
              {existingTags.length > 0 ? (
                <CommandGroup>
                  {existingTags.map((t) => {
                    const selected = value.selectedExistingIds.includes(t.id);
                    return (
                      <CommandItem
                        key={t.id}
                        value={t.name}
                        onSelect={() => toggleExisting(t.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            selected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {t.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}
              {showCreate ? (
                <CommandGroup heading="Create">
                  <CommandItem
                    onSelect={createFromQuery}
                    value={`__create__${trimmedQuery}`}
                  >
                    <Plus className="mr-2 size-4" />
                    Create &ldquo;{trimmedQuery}&rdquo;
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {totalSelected > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedExistingTags.map((t) => (
            <Badge key={t.id} variant="secondary" className="gap-1 pr-1">
              {t.name}
              <button
                type="button"
                onClick={() => toggleExisting(t.id)}
                aria-label={`Remove ${t.name}`}
                className="hover:bg-background/40 rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {value.newNames.map((n) => (
            <Badge key={n} variant="secondary" className="gap-1 pr-1">
              {n}
              <span className="text-xs opacity-60 ml-0.5">(new)</span>
              <button
                type="button"
                onClick={() => removeNew(n)}
                aria-label={`Remove ${n}`}
                className="hover:bg-background/40 rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
