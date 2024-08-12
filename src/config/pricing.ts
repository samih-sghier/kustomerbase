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
    propertiesLimit: number;
    usersLimit: number;
    uniqueFeatures?: string[];
    variantId?: {
        monthly: number;
        yearly: number;
    };
};

export type PricingFeature = {
    id: string;
    title: string;
    includedIn: string[];
};

export const pricingIds = {
    free: "free",
    basic: "basic",
    standard: "standard",
    unlimited: "unlimited",
} as const;

export const pricingFeatures: PricingFeature[] = [
    {
        id: "1",
        title: "Text Recognition Scanning",
        includedIn: [pricingIds.free, pricingIds.basic, pricingIds.standard, pricingIds.unlimited],
    },

    {
        id: "2",
        title: "Real Estate Marketplace Platforms Scanning (eg: Airbnb, Zillow, Craigslist...)",
        includedIn: [pricingIds.free, pricingIds.basic, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "3",
        title: "AI and Media-Based Scanning",
        includedIn: [pricingIds.basic, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "4",
        title: "Social Media Platforms Scanning (eg: Facebook groups...)",
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
    {
        id: pricingIds.free,
        title: "Free",
        description: "Monitor 1 property for basic subletting alerts.",
        price: {
            monthly: 0,
            yearly: 0,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "Forever",
        highlight: "Get started for free",
        buttonHighlighted: false,
        propertiesLimit: 1,
        usersLimit: 1,
        uniqueFeatures: [],
    },
    {
        id: pricingIds.basic,
        title: "Basic",
        description: "Monitor up to 5 properties with essential features.",
        price: {
            monthly: 29,
            yearly: 299,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight: "Ideal for small landlords",
        buttonHighlighted: true,
        propertiesLimit: 5,
        usersLimit: 2,
        uniqueFeatures: ["Real-time subletting alerts", "Daily subletting activity summaries", "Customizable alert filters"],
        variantId: { monthly: 456947, yearly: 456945 },
    },
    {
        id: pricingIds.standard,
        title: "Standard",
        description: "Monitor up to 25 properties with advanced features.",
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
        propertiesLimit: 25,
        usersLimit: 5,
        uniqueFeatures: ["Real-time subletting alerts", "Historical subletting data", "Daily subletting activity summaries", "Customizable alert filters", "Tenant communication tools", "Advanced analytics and reporting", "Dedicated customer support"],
        variantId: { monthly: 456949, yearly: 456952 },
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
        highlight: "For large property owners and property management companies",
        buttonHighlighted: false,
        propertiesLimit: Infinity,
        usersLimit: Infinity,
        uniqueFeatures: ["Real-time subletting alerts", "Historical subletting data", "Daily subletting activity summaries", "Customizable alert filters", "Tenant communication tools", "Advanced analytics and reporting", "API access for integrations", "Dedicated customer support"],
        variantId: { monthly: 456956, yearly: 456957 },
    },
];

