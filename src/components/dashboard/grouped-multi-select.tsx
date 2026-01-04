import * as React from "react"
import { Check, SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface FilterOption {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
}

export interface FilterGroup {
    key: string
    label: string
    options: FilterOption[]
}

interface GroupedMultiSelectProps {
    title?: string
    groups: FilterGroup[]
    selectedValues: Record<string, string[]> // key: group key, value: array of selected option values
    onChange: (values: Record<string, string[]>) => void
}

export function GroupedMultiSelect({
    title = "Filtros",
    groups,
    selectedValues,
    onChange,
}: GroupedMultiSelectProps) {
    // Count total selected items across all groups
    const totalSelectedCount = Object.values(selectedValues).reduce(
        (acc, curr) => acc + (curr?.length || 0),
        0
    )

    const handleSelect = (groupKey: string, optionValue: string) => {
        const currentGroupValues = selectedValues[groupKey] || []
        const isSelected = currentGroupValues.includes(optionValue)

        let newGroupValues
        if (isSelected) {
            newGroupValues = currentGroupValues.filter((v) => v !== optionValue)
        } else {
            newGroupValues = [...currentGroupValues, optionValue]
        }

        onChange({
            ...selectedValues,
            [groupKey]: newGroupValues,
        })
    }

    const handleClear = () => {
        onChange({})
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder={title}
                        className="focus:ring-0 focus:border-0 border-none outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 ring-offset-0"
                    />
                    <CommandList>
                        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                        {groups.map((group, index) => (
                            <React.Fragment key={group.key}>
                                <CommandGroup heading={group.label}>
                                    {group.options.map((option) => {
                                        const isSelected = (selectedValues[group.key] || []).includes(option.value)
                                        return (
                                            <CommandItem
                                                key={option.value}
                                                onSelect={() => handleSelect(group.key, option.value)}
                                            >
                                                <div
                                                    className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/50",
                                                        isSelected
                                                            ? "bg-primary/80 text-primary-foreground border-primary/80"
                                                            : "opacity-50 [&_svg]:invisible"
                                                    )}
                                                >
                                                    <Check className={cn("h-4 w-4")} />
                                                </div>
                                                {option.icon && (
                                                    <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span>{option.label}</span>
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                                {index < groups.length - 1 && <CommandSeparator />}
                            </React.Fragment>
                        ))}
                        {totalSelectedCount > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={handleClear}
                                        className="justify-center text-center"
                                    >
                                        Limpar filtros
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
