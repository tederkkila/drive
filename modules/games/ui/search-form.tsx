import React, { useState } from "react"
import { Search } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarInput,
} from "@/components/ui/sidebar"

interface SearchFormProps {
    limitUrlUpdates?: boolean;
}

export function SearchForm({ ...props }: React.ComponentProps<"form">) {

    // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const value = e.target.value;
    //     setLocalSearch(value);           // 1. Instant local text update
    //     setFilters({ search: value });   // 2. Debounced URL/State push via limitUrlUpdates
    // };

    return (
        <form {...props}>
            <SidebarGroup className="py-0">
                <SidebarGroupContent className="relative">
                    <Label htmlFor="search" className="sr-only">
                        Search
                    </Label>
                    <SidebarInput
                        id="search"
                        placeholder="Search by term..."
                        // value={localSearch}
                        // onChange={handleSearchChange}
                        className="pl-8"
                    />
                    <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                </SidebarGroupContent>
            </SidebarGroup>
        </form>
    )
}
