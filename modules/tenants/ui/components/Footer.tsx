import Link from "next/link";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/cn";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});

export const Footer = () => {
    return (
        <footer className="border-t font-medium bg-white">
            <div className="max-w-(--breakpoint-xl) mx-auto flex items-center h-full gap-2 px-4 py-2">
                <p>Powered by</p>
                <Link href={process.env.NEXT_PUBLIC_APP_URL!}>
                  <span className={cn("text-xl font-semibold", poppins.className)}>
                    HENRYMITCHELL.NET
                  </span>
                </Link>
            </div>
        </footer>
    );
};