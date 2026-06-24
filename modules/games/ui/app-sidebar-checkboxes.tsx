"use client";

import React, {useState, useEffect, useTransition} from "react"
import { ChevronRight, Search } from "lucide-react"

import { VersionSwitcher } from "@/modules/games/ui/version-switcher"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader, SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useQueryStates, parseAsArrayOf, parseAsString, debounce } from "nuqs"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Label } from "@/components/ui/label";
import { useGameVideo } from "@/modules/games/ui/GameContext";
import { useParams } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

// This is sample data.
const data = {
    versions: ["NZL U18", "AUS U18"],
    navMain: [
        // {
        //     title: "Drive Number",
        //     url: "#",
        //     items: [
        //         {
        //             title: "001",
        //             url: "#",
        //         },
        //         {
        //             title: "002",
        //             url: "#",
        //         },
        //         {
        //             title: "003",
        //             url: "#",
        //         },
        //     ],
        // },
        {
            title: "Play Type",
            group: "playType",
            items: [
                {
                    title: "Run",
                    id: "run",
                },
                {
                    title: "Pass",
                    id: "pass",
                },
                {
                    title: "Penalty",
                    id: "penalty",
                },
            ],
        },
        {
            title: "Down",
            group: "down",
            items: [
                {
                    title: "1st Down",
                    id: "1",
                },
                {
                    title: "2nd Down",
                    id: "2",
                    isActive: true,
                },
                {
                    title: "3rd Down",
                    id: "3",
                },
                {
                    title: "4th Down",
                    id: "4",
                },
            ],
        },
        {
            title: "Distance",
            group: "distance",
            items: [
                {
                    title: "0-3 yards",
                    id: "3",
                },
                {
                    title: "3-6 yards",
                    id: "6",
                },
                {
                    title: "7-10 yards",
                    id: "10",
                },
                {
                    title: "10+ yards",
                    id: "long",
                },
            ],
        },
        {
            title: "Gain",
            group: "gain",
            items: [
                {
                    title: "<0",
                    id: "#",
                },
                {
                    title: "0",
                    id: "#",
                },
                {
                    title: "1-5",
                    id: "#",
                },
                {
                    title: "5-10",
                    id: "#",
                },
                {
                    title: "10+",
                    id: "#",
                },
                {
                    title: "20+",
                    id: "#",
                },
            ],
        },
        {
            title: "Field Position",
            group: "fieldPosition",
            items: [
                {
                    title: "-1 to -20",
                    id: "backedUp",
                },
                {
                    title: "-20 to 40",
                    id: "midfield",
                },
                {
                    title: "40-20",
                    id: "greenZone",
                },
                {
                    title: "20-5",
                    id: "redZone",
                },
                {
                    title: "5-0",
                    id: "goalLine",
                },
            ],
        },

    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const groupParsers = {
        search: parseAsString
            .withOptions({
                // clearOnDefault: true,
                limitUrlUpdates: debounce(500),
                shallow: false,
            })
            .withDefault(""),
        playType: parseAsArrayOf(parseAsString).withDefault([]),
        down: parseAsArrayOf(parseAsString).withDefault([]),
        distance: parseAsArrayOf(parseAsString).withDefault([]),
        gain: parseAsArrayOf(parseAsString).withDefault([]),
        fieldPosition: parseAsArrayOf(parseAsString).withDefault([]),
        // Easily add more groups here...
    }

    const [groupStates, setGroupStates] = useQueryStates(groupParsers)

    const [localSearch, setLocalSearch] = useState(groupStates.search);

    const { expandedDriveIds, setExpandedDriveIds } = useGameVideo();
    const params = useParams();
    const gameId = params?.gameId as string;
    const trpc = useTRPC();

    const { data: gameData } = useQuery(
        trpc.games.getGameWithDrives.queryOptions({ gameId }, { enabled: !!gameId })
    );

    const driveIds = gameData?.drives?.map(d => d.id) ?? [];
    const allExpanded = driveIds.length > 0 && expandedDriveIds.length === driveIds.length;

    const toggleAllDrives = () => {
        if (allExpanded) {
            setExpandedDriveIds([]);
        } else {
            setExpandedDriveIds(driveIds);
        }
    };

    // 1. Initialize the transition hook
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setLocalSearch(groupStates.search);
    }, [groupStates.search]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 2. Instant high-priority UI paint
        setLocalSearch(value);

        // 3. Batch URL/Query computation as a low-priority transition
        startTransition(() => {
            setGroupStates({ search: value });
        });
    };

    const totalActiveFilters = Object.entries(groupStates).reduce(
        (acc, [key, value]) => {
            // 1. If it's your search string, count it as exactly 1 if it has text inside
            if (key === 'search') {
                return acc + (typeof value === 'string' && value.trim() !== '' ? 1 : 0);
            }

            // 2. Otherwise, treat it as your checkbox arrays and count the selected items
            return acc + (Array.isArray(value) ? value.length : 0);
        },
        0
    );

    const isClearDisabled = totalActiveFilters === 0

    const handleClearAllGroups = () => {
        const clearedState = Object.keys(groupParsers).reduce((acc, key) => {
            acc[key as keyof typeof groupParsers] = null
            return acc
        }, {} as Record<keyof typeof groupParsers, null>)

        setGroupStates(clearedState)
    }

    const handleGroupChange = (groupKey: keyof typeof groupParsers, title: string, checked: boolean) => {

        // TypeScript safe lookup of the current array state
        const currentValues = (groupStates[groupKey] ?? []) as string[]

        const newValues = checked
            ? [...currentValues, title]
            : currentValues.filter((v) => v !== title)

        // Dynamically update only the specific URL parameter group
        setGroupStates({
            [groupKey]: newValues.length > 0 ? newValues : null
        })
    }



    return (
        <Sidebar {...props}>
            <SidebarHeader>

                <VersionSwitcher
                    versions={data.versions}
                    defaultVersion={data.versions[0]}
                />

                <div className="px-4 py-2 border-b">
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-2 text-xs"
                            onClick={toggleAllDrives}
                            disabled={driveIds.length === 0}
                        >
                            {allExpanded ? (
                                <>
                                    <ChevronUp className="h-3.5 w-3.5" />
                                    <span>Close all drives</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-3.5 w-3.5" />
                                    <span>Open all drives</span>
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isClearDisabled}
                            className="w-full justify-start gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                            onClick={handleClearAllGroups}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>
                                Clear all filters {totalActiveFilters > 0 && `(${totalActiveFilters})`}
                            </span>
                        </Button>
                    </div>
                </div>

                {/*<SearchForm />*/}
                <SidebarGroup className="py-0">
                    <SidebarGroupContent className="relative">
                        <Label htmlFor="search" className="sr-only">
                            Search
                        </Label>
                        <SidebarInput
                            id="search"
                            type="text"
                            placeholder="Search by term..."
                            value={localSearch}
                            onChange={handleSearchChange}
                            className="pl-8"
                        />
                        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                    </SidebarGroupContent>
                </SidebarGroup>


            </SidebarHeader>
            <SidebarContent className="gap-0">
                {/* We create a collapsible SidebarGroup for each parent. */}
                {data.navMain.map((item) => {

                    const groupKey = item.group as keyof typeof groupParsers
                    const activeGroupValues = (groupStates[groupKey] ?? []) as string[]

                    return (
                    <Collapsible
                        key={item.title}
                        title={item.title}
                        defaultOpen
                        className="group/collapsible"
                    >
                        <SidebarGroup>
                            <SidebarGroupLabel
                                asChild
                                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <CollapsibleTrigger>
                                    {item.title}{" "}
                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>

                                        {item.items.map((subItem) => {

                                            const isChecked = activeGroupValues.includes(subItem.id)

                                            return (
                                                <SidebarMenuItem key={subItem.title + subItem.id}>
                                                    <SidebarMenuButton asChild>
                                                        <label className="flex w-full items-center gap-2 cursor-pointer select-none">
                                                            <Checkbox
                                                                id={subItem.id}
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) =>
                                                                    handleGroupChange(groupKey, subItem.id, !!checked)
                                                                }
                                                            />
                                                            <span>{subItem.title}</span>
                                                        </label>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                )}
                )}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
