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
        "Chatbot",
        "Email Automation",
        "Email Marketing",
        "Email Marketing Software",
        "Email Marketing Platform",
        "Email Marketing Tools",
        "Email Marketing Services",
        "Email Marketing Campaigns",
        "Email Marketing Automation",
        "Email Marketing Software",
        "Email Marketing Platform",
        "Email Marketing Tools",
        "Email Marketing Services",
        "Email Marketing Campaigns",
        "Email Marketing Automation",
        "Email Marketing Software",
        "Email Marketing Platform",
        "Email Marketing Tools",
        "Email Marketing Services",
    ],
    authors: [{ name: "Inboxpilot", url: "https://x.com/Inboxpilot" }],
    creator: "Inboxpilot",
};

export const twitterMetadata: Metadata["twitter"] = {
    title: siteConfig.name,
    description: siteConfig.description,
    card: "summary_large_image",
    images: [siteConfig.orgImage],
    creator: "@Inboxpilot",
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
