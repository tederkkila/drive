import * as React from "react"
import { ChevronRight } from "lucide-react"

import { SearchForm } from "@/modules/games/ui/search-form"
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
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
    versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
    navMain: [
        {
            title: "Play Type",
            url: "#",
            items: [
                {
                    title: "Run",
                    url: "#",
                },
                {
                    title: "Pass",
                    url: "#",
                },
            ],
        },
        {
            title: "Down & Distance",
            url: "#",
            items: [
                {
                    title: "1st Down",
                    url: "#",
                },
                {
                    title: "2nd Down",
                    url: "#",
                    isActive: true,
                },
                {
                    title: "3rd Down",
                    url: "#",
                },
                {
                    title: "4th Down",
                    url: "#",
                },
            ],
        },
        {
            title: "Distance",
            url: "#",
            items: [
                {
                    title: "0-3 yards",
                    url: "#",
                },
                {
                    title: "3-6 yards",
                    url: "#",
                },
                {
                    title: "7-10 yards",
                    url: "#",
                },
                {
                    title: "10+ yards",
                    url: "#",
                },
            ],
        },
        {
            title: "Gain",
            url: "#",
            items: [
                {
                    title: "<0",
                    url: "#",
                },
                {
                    title: "0",
                    url: "#",
                },
                {
                    title: "1-5",
                    url: "#",
                },
                {
                    title: "5-10",
                    url: "#",
                },
                {
                    title: "10+",
                    url: "#",
                },
                {
                    title: "20+",
                    url: "#",
                },
            ],
        },
        {
            title: "Field Position",
            url: "#",
            items: [
                {
                    title: "-1 to -25",
                    url: "#",
                },
                {
                    title: "-25 to 25",
                    url: "#",
                },
                {
                    title: "25-5",
                    url: "#",
                },
                {
                    title: "5-0",
                    url: "#",
                },
            ],
        },
        {
            title: "Community",
            url: "#",
            items: [
                {
                    title: "Contribution Guide",
                    url: "#",
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <VersionSwitcher
                    versions={data.versions}
                    defaultVersion={data.versions[0]}
                />
                <SearchForm />
            </SidebarHeader>
            <SidebarContent className="gap-0">
                {/* We create a collapsible SidebarGroup for each parent. */}
                {data.navMain.map((item) => (
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
                                        {item.items.map((item) => (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton asChild isActive={item.isActive}>
                                                    <a href={item.url}>{item.title}</a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
