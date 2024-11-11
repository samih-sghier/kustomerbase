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
        "Chatbase for Gmail",
        "AI Email Assistant",
        "Automated Customer Support Email",
        "Intelligent Email Response System",
        "AI-Powered Email Automation",
        "Smart Email Reply Bot",
        "Machine Learning Email Management",
        "Chatbase Email Integration",
        "AI Customer Service Emails",
        "Automated Email Workflow",
        "Natural Language Processing Emails",
        "Email AI for Business",
        "Personalized AI Email Responses",
        "AI-Driven Email Support",
        "Chatbot Email Automation",
        "Self-Learning Email Bot",
        "AI Email Triage",
        "Automated Email Ticketing System",
        "Intelligent Email Routing",
        "AI Email Classification",
        "Real-Time Email AI Solutions",
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
    authors: [{ name: "Inboxpilot", url: "https://x.com/inboxpilot" }],
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
