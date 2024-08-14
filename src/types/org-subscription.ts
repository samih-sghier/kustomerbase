import type { getOrgSubscription } from "@/server/actions/stripe_subscription/query";

export type OrgSubscription = Awaited<ReturnType<typeof getOrgSubscription>>;
