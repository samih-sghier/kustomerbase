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
import { siteConfig } from "./site";

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
    monthlyTokens: number;
    chatbots: number;
    charactersPerChatbot: number;
    teamMembers: number;
    links: number | number;
};

export type PricingFeature = {
    id: string;
    title: string;
    includedIn: string[];
};

export const pricingIds = {
    free: "free",
    hobby: "hobby",
    standard: "standard",
    unlimited: "unlimited",
} as const;

export const pricingFeatures: PricingFeature[] = [
    {
        id: "1",
        title: "Message credits/month",
        includedIn: [pricingIds.free, pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "2",
        title: "Accounts",
        includedIn: [pricingIds.free, pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "3",
        title: "characters data",
        includedIn: [pricingIds.free, pricingIds.hobby, pricingIds.standard],
    },
    {
        id: "4",
        title: "Team members",
        includedIn: [pricingIds.free, pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "5",
        title: "Links to train on",
        includedIn: [pricingIds.free, pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "6",
        title: "Connect unlimited email accounts",
        includedIn: [pricingIds.free, pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "7",
        title: "Capture leads",
        includedIn: [pricingIds.free, pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "8",
        title: "View chat history",
        includedIn: [pricingIds.free, pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "9",
        title: "GPT-4o (most advanced and efficient model)",
        includedIn: [pricingIds.free, pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "10",
        title: "API access",
        includedIn: [pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "11",
        title: "Integrations",
        includedIn: [pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "12",
        title: "Basic Analytics",
        includedIn: [pricingIds.hobby, pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "13",
        title: "Option to choose GPT-4 and GPT-4-Turbo",
        includedIn: [pricingIds.standard, pricingIds.unlimited],
    },
    {
        id: "14",
        title: `Remove 'Powered by ${siteConfig.name}co'`,
        includedIn: [pricingIds.unlimited],
    },
    {
        id: "15",
        title: "Use your own custom domains",
        includedIn: [pricingIds.unlimited],
    },
    {
        id: "16",
        title: "Advanced Analytics",
        includedIn: [pricingIds.unlimited],
    },
];

export const pricingPlans: PricingPlan[] = [
    {
        id: pricingIds.free,
        title: "Free",
        description: "Get started for free",
        price: {
            monthly: 0,
            yearly: 0,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "Forever",
        highlight: "20 message credits/month",
        buttonHighlighted: false,
        planLimit: 1,
        usersLimit: 1,
        uniqueFeatures: ["1 chatbot", "400,000 characters/chatbot", "1 team member", "Limit to 10 links to train on"],
        monthlyTokens: 20000,
        chatbots: 1,
        charactersPerChatbot: 400000,
        teamMembers: 1,
        links: 10,
    },
    {
        id: pricingIds.hobby,
        title: "Hobby",
        description: "Everything in Free, plus...",
        price: {
            monthly: 19,
            yearly: 190,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight: "2,000 message credits/month",
        buttonHighlighted: false,
        planLimit: 2,
        usersLimit: 1,
        uniqueFeatures: ["2 chatbots", "11,000,000 characters/chatbot", "Unlimited links to train on", "API access", "Integrations"],
        monthlyTokens: 150000,
        chatbots: 2,
        charactersPerChatbot: 11000000,
        teamMembers: 1,
        links: Infinity,
        priceId: {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBY_MONTHLY ?? "",
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBY_YEARLY ?? ""
        },
    },
    {
        id: pricingIds.standard,
        title: "Standard",
        description: "Everything in Hobby, plus...",
        price: {
            monthly: 99,
            yearly: 990,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight: "10,000 message credits/month",
        buttonHighlighted: true,
        planLimit: 5,
        usersLimit: 3,
        uniqueFeatures: ["5 chatbots", "3 team members", "Option to choose GPT-4 and GPT-4-Turbo"],
        monthlyTokens: 1000000,
        chatbots: 5,
        charactersPerChatbot: 11000000,
        teamMembers: 3,
        links: Infinity,
        priceId: {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_MONTHLY ?? "",
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_YEARLY ?? ""
        },
    },
    {
        id: pricingIds.unlimited,
        title: "Unlimited",
        description: "Everything in Standard, plus...",
        price: {
            monthly: 399,
            yearly: 3990,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight: "40,000 message credits/month included (Messages over the limit will use your OpenAI API Key)",
        buttonHighlighted: false,
        planLimit: 10,
        usersLimit: 5,
        uniqueFeatures: [`10 chatbots", "5 team members", "Remove 'Powered by ${siteConfig.name}'", "Use your own custom domains", "Advanced Analytics`],
        monthlyTokens: 5000000,
        chatbots: 10,
        charactersPerChatbot: Infinity,
        teamMembers: 5,
        links: Infinity,
        priceId: {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED_MONTHLY ?? "",
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED_YEARLY ?? ""
        },
    },
];


export const freePricingPlan = pricingPlans.find(plan => plan.id === pricingIds.free); // Retrieve the free pricing plan