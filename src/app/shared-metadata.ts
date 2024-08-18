import { siteConfig } from "@/config/site";
import { siteUrls } from "@/config/urls";
import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
    title: {
        template: `%s | ${siteConfig.name}`,
        default: siteConfig.name,
    },
    description: siteConfig.description,
    metadataBase: new URL(siteUrls.publicUrl),
    keywords: [
        "Illegal Subleasing Detection",
        "Illegal Subleasing Prevention",
        "Notice to Vacate",
        "N12",
        "Section 21",
        "Prevent Subleasing",
        "Sublease Alerts",
        "Illegal Tenants",
        "Landlord Compliance Tools",
        "Property Compliance Management",
        "Subleasing Detection Software",
        "Subleasing Monitoring Tools",
        "Tenant Compliance Tracking",
        "Landlord Property Management Solutions",
        "Subleasing Risk Assessment",
        "Compliance Solutions for Landlords",
        "Automated Subleasing Alerts",
        "Illegal Subleasing Alerts",
        "Property Compliance Platform",
        "Subleasing Enforcement Solutions",
        "Tenant Violation Detection",
        "Subleasing Management"
    ],
    authors: [{ name: "SubletGuard", url: "https://x.com/subletguard" }],
    creator: "SubletGuard",
};

export const twitterMetadata: Metadata["twitter"] = {
    title: siteConfig.name,
    description: siteConfig.description,
    card: "summary_large_image",
    images: [siteConfig.orgImage],
    creator: "@subletguard",
};

export const ogMetadata: Metadata["openGraph"] = {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    images: [{ url: siteConfig.orgImage, alt: siteConfig.name }],
    locale: "en_US",
    url: siteUrls.publicUrl,
    siteName: siteConfig.name,
};
