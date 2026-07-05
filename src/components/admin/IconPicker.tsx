import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import DynamicIcon, { ICON_NAMES, resolveIconName } from "@/components/DynamicIcon";
import { ChevronsUpDown, X } from "lucide-react";

interface IconPickerProps {
  value?: string | null;
  onChange: (iconName: string) => void;
}

const PAGE = 60;

/** Searchable picker over the full lucide icon library with live previews. */
const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = resolveIconName(value);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, "-");
    const all = q ? ICON_NAMES.filter((n) => n.includes(q)) : ICON_NAMES;
    return all.slice(0, PAGE);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between font-normal">
          <span className="flex items-center gap-2 min-w-0">
            <DynamicIcon name={selected} className="h-4 w-4 shrink-0" />
            <span className="truncate">{selected || "Select an icon…"}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-3" align="start">
        <Input
          autoFocus
          placeholder="Search all icons… (e.g. chart, database)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-3"
        />
        <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto pr-1">
          {matches.map((name) => (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
              className={`flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors ${
                name === selected ? "bg-accent text-accent-foreground ring-1 ring-primary" : ""
              }`}
            >
              <DynamicIcon name={name} className="h-5 w-5" />
            </button>
          ))}
          {matches.length === 0 && (
            <p className="col-span-6 text-center text-sm text-muted-foreground py-6">
              No icons match “{query}”
            </p>
          )}
        </div>
        {selected && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full text-muted-foreground"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            <X className="h-3.5 w-3.5 mr-1.5" /> Clear selection
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;
