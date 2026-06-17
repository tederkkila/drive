"use client";

import Link from "next/link";
import React, {useState} from "react";
import {Poppins} from "next/font/google";
import Image from "next/image";
import {usePathname} from "next/navigation";

import { cn } from "@/lib/cn";

import NavbarSidebar from "./NavbarSidebar";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Box, Flex, Button, Skeleton } from '@radix-ui/themes';
import { Media, Tenant } from "@/payload-types";


const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});



interface NavbarItemProps {
    href: string,
    children: React.ReactNode,
    isActive?: boolean,
    key?: React.Key,
}

const NavbarItem = ({
                        href,
                        children,
                        isActive,
                    }: NavbarItemProps) => {
    return (
        <Button
            asChild
            variant="solid"
            color="gray"
            highContrast
        >
            <Link href={href}>
                {children}
            </Link>
        </Button>
    );
};

interface NavbarProps {
    tenantSlug: string;
}

export const Navbar = ({ tenantSlug }: NavbarProps) => {

    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.tenants.getOne.queryOptions({ tenantSlug }));

    const tenant = data as Tenant & { icon: Media | null, image: Media | null }

    const navbarItems = [
        {href: "/games", children: "Games"},
    ];

    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <header className="h-16 border-b font-medium justity-between bg-white">
            <div className="max-w-(--breakpoint-xl) mx-auto flex items-center h-full gap-2 px-4 py-6" >
                <Link href={'/'} className="flex items-center mr-8">
                    {tenant.icon?.url && (
                        <Image
                            alt={"tenantSlug"}
                            src={tenant.icon.url}
                            width={48}
                            height={48}
                            className="shrink-0 size-12"
                            style={{ filter: 'drop-shadow(0 60px 0 var(--primary)', transform: 'translateY(-60px)' }}

                        />
                    )}
                    <span className={cn("leading-0 text-primary text-3xl md:text-4xl font-semibold", poppins.className)}>
                      {tenant.name?.toLowerCase()}
                    </span>
                </Link>



                <nav className="flex gap-4 w-full">

                    <div className="items-center gap-4 hidden md:flex">
                        {navbarItems.map((item, index) => (
                            <NavbarItem
                                key={index}
                                href={item.href}
                                isActive={pathname === item.href}
                            >
                                {item.children}
                            </NavbarItem>
                        ))}
                    </div>

                    <div className="items-center gap-4 flex md:hidden">
                        <NavbarSidebar
                            items={navbarItems}
                            open={isSidebarOpen}
                            onOpenChange={setIsSidebarOpen}
                        />
                    </div>

                </nav>

            </div>
        </header>
    )
}

export const NavbarSkeleton = () => {
    return (
        <header className="h-16 border-b font-medium justity-between bg-white">
            <div className="max-w-(--breakpoint-xl) mx-auto flex items-center h-full gap-2 px-4 py-6" >

                <Skeleton className="w-48 h-48 rounded-full" />
                <Skeleton className="w-48 h-48 rounded-full" />
                <Skeleton className="w-48 h-48 rounded-full" />

            </div>
        </header>
    );
};