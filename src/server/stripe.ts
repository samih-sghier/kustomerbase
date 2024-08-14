import { env } from "@/env";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SK, {
    apiVersion: '2024-06-20',
});


export default stripe;