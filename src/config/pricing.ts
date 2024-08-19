/**
 * This file contains the pricing data for the pricing page.
 *
 * @add a new pricing plan, add a new object to the `pricing` array.
 * 1. Add id to the pricingIds object then use it as the id of the new pricing object.
 * 2. Add badge(optional), title, description, price, currency, duration, highlight, popular, and uniqueFeatures(optional) to the new pricing object.
 * 3. if the new pricing plan has unique features, add a new object to the `uniqueFeatures` array.
 *
 * @add a new feature, add a new object to the `features` array.
 * 1. Add id to the features object then use it as the id of the new feature object.
 * 2. Add title and includedIn to the new feature object. (includedIn is an array of pricing plan ids that include this feature)
 */
import { env } from "@/env";

export type PricingPlan = {
    id: string;
    badge?: string;
    title: string;
    description: string;
    price: {
        monthly: number;
        yearly: number;
    };
    currency: {
        code: string;
        symbol: string;
    };
    duration: string;
    highlight: string;
    buttonHighlighted: boolean;
    planLimit: number;
    usersLimit: number;
    uniqueFeatures?: string[];
    variantId?: {
        monthly: number;
        yearly: number;
    };
    priceId?: {
        monthly: string;
        yearly: string;
    };
};

export type PricingFeature = {
    id: string;
    title: string;
    includedIn: string[];
};

export const pricingIds = {
    free: "free",
    hobby: "hobby",
    basic: "basic",
    standard: "standard",
    unlimited: "unlimited",
} as const;

export const pricingFeatures: PricingFeature[] = [
    {
        id: "1",
        title: "Notice to Vacate Alerts (eg: N-12, Section 21...)",
        includedIn: [pricingIds.hobby, pricingIds.basic, pricingIds.standard, pricingIds.unlimited],
    },
    
    {
        id: "2",
        title: "Image-Based and Text Recognition Scanning",
        includedIn: [pricingIds.hobby, pricingIds.basic, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "3",
        title: "Real Estate Marketplace Platforms Scanning (e.g., Airbnb, Zillow...)",
        includedIn: [pricingIds.hobby, pricingIds.basic, pricingIds.standard, pricingIds.unlimited],
    },
    // {
    //     id: "2",
    //     title: "AI and Media-Based Scanning",
    //     includedIn: [pricingIds.basic, pricingIds.standard, pricingIds.unlimited],
    // },

    // Uncomment and modify this entry as needed
    {
        id: "4",
        title: "Social Media Platforms Scanning (e.g: Reddit, Facebook groups...)",
        includedIn: [pricingIds.basic, pricingIds.standard, pricingIds.unlimited],
    },

    {
        id: "5",
        title: "Real-time subletting alerts",
        includedIn: [pricingIds.basic, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "6",
        title: "Daily subletting activity summaries",
        includedIn: [pricingIds.basic, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "7",
        title: "Historical subletting data",
        includedIn: [pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "8",
        title: "Customizable alert filters",
        includedIn: [pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "9",
        title: "Tenant communication tools",
        includedIn: [pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "10",
        title: "Advanced analytics and reporting",
        includedIn: [pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "11",
        title: "Dedicated customer support",
        includedIn: [pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "12",
        title: "API access for integrations",
        includedIn: [pricingIds.unlimited],
    },
];


export const pricingPlans: PricingPlan[] = [
    // {
    //     id: pricingIds.free,
    //     title: "Free",
    //     description: "Monitor 1 property for basic subletting alerts.",
    //     price: {
    //         monthly: 0,
    //         yearly: 0,
    //     },
    //     currency: {
    //         code: "USD",
    //         symbol: "$",
    //     },
    //     duration: "Forever",
    //     highlight: "Get started for free",
    //     buttonHighlighted: false,
    //     planLimit: 1,
    //     usersLimit: 1,
    //     uniqueFeatures: [],
    // },
    {
        id: pricingIds.hobby,
        title: "Hobby",
        description: "Monitor 2 properties for basic rental activity alerts.",
        price: {
            monthly: 9,
            yearly: 90,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight: "Get started for cheap",
        buttonHighlighted: false,
        planLimit: 2,
        usersLimit: 1,
        uniqueFeatures: [],
        priceId: {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBY_MONTHLY ?? "",
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBY_YEARLY ?? ""
        },
    },
    {
        id: pricingIds.basic,
        title: "Basic",
        description: "Monitor up to 10 properties with essential features.",
        price: {
            monthly: 29,
            yearly: 299,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight: "Ideal for small sized real estate companies",
        buttonHighlighted: false,
        planLimit: 10,
        usersLimit: 2,
        uniqueFeatures: ["Real-time subletting alerts", "Daily subletting activity summaries", "Customizable alert filters"],
        variantId: { monthly: 456947, yearly: 456945 },
        priceId: {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY ?? "",
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_YEARLY ?? ""
        },
    },
    {
        id: pricingIds.standard,
        title: "Standard",
        description: "Monitor up to 50 properties with advanced features.",
        price: {
            monthly: 99,
            yearly: 999,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight: "Most popular plan",
        buttonHighlighted: true,
        planLimit: 50,
        usersLimit: 5,
        uniqueFeatures: ["Real-time subletting alerts", "Historical subletting data", "Daily subletting activity summaries", "Customizable alert filters", "Tenant communication tools", "Advanced analytics and reporting", "Dedicated customer support"],
        variantId: { monthly: 456949, yearly: 456952 },
        priceId: {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_MONTHLY ?? "",
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_YEARLY ?? ""
        },
    },
    {
        id: pricingIds.unlimited,
        title: "Unlimited",
        description: "Unlimited properties and users, API access, and premium support.",
        price: {
            monthly: 399,
            yearly: 3999,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight: "For large real estate and property management companies",
        buttonHighlighted: false,
        planLimit: Infinity,
        usersLimit: Infinity,
        uniqueFeatures: ["Real-time subletting alerts", "Historical subletting data", "Daily subletting activity summaries", "Customizable alert filters", "Tenant communication tools", "Advanced analytics and reporting", "API access for integrations", "Dedicated customer support"],
        variantId: { monthly: 456956, yearly: 456957 }, // not used anymore, legacy for lemonsqueezy integration
        priceId: {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED_MONTHLY ?? "",
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED_YEARLY ?? ""
        },
    },
];

