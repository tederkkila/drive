"use client"

import * as React from "react"
import { Check, ChevronsUpDown, GalleryVerticalEnd } from "lucide-react"
import { Team } from "@/payload-types"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const getTeamLabel = (team: Team) => `${team.abbreviation} ${team.level}`

export function TeamSwitcher({
        teams,
        defaultTeamId,
    }: {
        teams: Team[]
        defaultTeamId?: string
}) {

    const [selectedTeamId, setSelectedTeamId] = React.useState(
        defaultTeamId ?? teams[0]?.id ?? ""
    )

    React.useEffect(() => {
        if (!defaultTeamId) return

        setSelectedTeamId(defaultTeamId)
    }, [defaultTeamId])

    const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0]

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <GalleryVerticalEnd className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">Team</span>
                                <span >{selectedTeam ? getTeamLabel(selectedTeam) : "Select team"}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width)"
                        align="start"
                    >
                        {teams.map((team) => (
                            <DropdownMenuItem
                                key={team.id}
                                onSelect={() => setSelectedTeamId(team.id)}
                            >
                                {getTeamLabel(team)}
                                {team.id === selectedTeamId && <Check className="ml-auto" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
