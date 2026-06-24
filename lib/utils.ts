import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTenantFaviconDomain(tenantSlug: string) {
  const isDevelopment = process.env.APP_ENV === "development";
  const isSubdomainRoutingEnabled = process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING === "true";

  // In development or subdomain routing disabled mode, use normal routing
  if (!isSubdomainRoutingEnabled) {
    //just send it to the media directly. No vercel subdomain required
    return `${process.env.NEXT_PUBLIC_APP_URL}`;
  }

  const protocol = (isDevelopment) ? "http" : "https";
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  return `${protocol}://${tenantSlug}.${domain}`;
}
