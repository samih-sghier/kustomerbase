"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { siteUrls } from "@/config/urls";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";
import { changePlan } from "@/server/actions/stripe_subscription/mutation";
import {
    getCheckoutURL,
    getOrgSubscription,
} from "@/server/actions/stripe_subscription/query";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type SubscribeBtnProps = {
    priceId?: string;
    variantId?: number;
    onSuccess?: () => void;
} & ButtonProps;

export function SubscribeBtn({ priceId, variantId, onSuccess, ...props }: SubscribeBtnProps) {
    const router = useRouter();

    const [, startAwaitableTransition] = useAwaitableTransition();

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const data = await handleSubscription();
            if (data && typeof data !== "string") {
                await startAwaitableTransition(() => {
                    router.refresh();
                    router.push(siteUrls.organization.plansAndBilling);
                });
                toast.success("Plan changed successfully!"); // Toast for plan change
                if (onSuccess) {
                    onSuccess();
                }
            }
            return data;
        },
        onError: (error) => {
            toast.error(error.message ?? "An error occurred.");
        },
        onSuccess: (checkoutUrl) => {
            if (checkoutUrl && typeof checkoutUrl === "string") {
                router.push(checkoutUrl);
            }
        },
    });

    const handleSubscription = async () => {
        const subscription = await getOrgSubscription();
        if (!subscription || (subscription.ends_at && new Date(subscription.ends_at) < new Date())) {
            return await getCheckoutURL(priceId);
        } else {
            if (subscription.status == 'paused') {
                toast.error("The subscription is currently paused. To update the plan or make any changes, you need to first resume the subscription.");
                return null;
            } else if (subscription.status == 'canceled') {
                toast.error("The subscription is currently canceled. To update the plan or make any changes, you need to first resume the subscription.");
                return null;
            } else {
                return await changePlan(subscription.priceId!, priceId!);
            }
        }
    };

    return (
        <Button
            disabled={isPending || props.disabled}
            onClick={() => mutate()}
            {...props}
        >
            {isPending && <Icons.loader className="mr-2 h-4 w-4" />}
            {props.children}
        </Button>
    );
}
