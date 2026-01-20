"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface MultiSelectOption {
    label: string
    value: string
}

interface MultiSelectProps {
    options: MultiSelectOption[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    className?: string
    badgeClassName?: string
    maxDisplayed?: number
}

/**
 * MultiSelect - A reusable multi-select component based on shadcn Command/Popover
 * 
 * @example
 * ```tsx
 * <MultiSelect
 *   options={[{ label: "Option 1", value: "1" }]}
 *   selected={selectedValues}
 *   onChange={setSelectedValues}
 *   placeholder="Selecione..."
 * />
 * ```
 */
export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Selecione...",
    searchPlaceholder = "Buscar...",
    emptyMessage = "Nenhum resultado encontrado.",
    className,
    badgeClassName,
    maxDisplayed = 2,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (value: string) => {
        const isSelected = selected.includes(value)
        if (isSelected) {
            onChange(selected.filter((v) => v !== value))
        } else {
            onChange([...selected, value])
        }
    }

    const handleRemove = (value: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(selected.filter((v) => v !== value))
    }

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange([])
    }

    const selectedLabels = selected
        .map((value) => options.find((opt) => opt.value === value)?.label)
        .filter(Boolean)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "min-w-[180px] justify-between font-normal h-9",
                        selected.length === 0 && "text-muted-foreground",
                        className
                    )}
                >
                    <div className="flex items-center gap-1 flex-1 overflow-hidden">
                        {selected.length === 0 ? (
                            <span className="truncate">{placeholder}</span>
                        ) : selected.length <= maxDisplayed ? (
                            <div className="flex gap-1 flex-wrap">
                                {selectedLabels.slice(0, maxDisplayed).map((label, idx) => (
                                    <Badge
                                        key={selected[idx]}
                                        variant="secondary"
                                        className={cn("text-xs py-0 px-1.5 h-5", badgeClassName)}
                                    >
                                        {label}
                                        <button
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={(e) => handleRemove(selected[idx], e)}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <Badge variant="secondary" className={cn("text-xs py-0 px-1.5 h-5", badgeClassName)}>
                                {selected.length} selecionado(s)
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {selected.length > 0 && (
                            <button
                                className="rounded-full p-0.5 hover:bg-muted"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleClearAll}
                            >
                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                        )}
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} className="h-9" />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selected.includes(option.value)
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => handleSelect(option.value)}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className="h-3 w-3" />
                                        </div>
                                        <span className="truncate">{option.label}</span>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
