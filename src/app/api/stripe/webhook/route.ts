import { env } from "@/env";
import crypto from "node:crypto";
import { webhookHasMeta } from "@/validations/stripe"; // Update import to Stripe

import stripe from "@/server/stripe";
import { storeWebhookEvent, processWebhookEvent } from "@/server/actions/stripe_subscription/mutation";

// Stripe webhook endpoint secret

// webhook path https://example.com/api/stripe/webhook

export async function POST(request: Request) {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature") ?? "";
    const stripeSecret = env.STRIPE_HOOK_SECRET;

    try {
        const event = stripe.webhooks.constructEvent(rawBody, signature, stripeSecret);

        if (webhookHasMeta(event)) {
            const webhookEventId:any = await storeWebhookEvent(
                event.type,
                event
            );

            void processWebhookEvent(webhookEventId!);

            return new Response("OK", { status: 200 });
        }

        return new Response("Data invalid", { status: 400 });
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return new Response("Webhook Error", { status: 400 });
    }
}
