"use client";

import { Button } from "@/components/ui/button";
import {
    cancelPlan,
    pausePlan,
    resumePlan,
} from "@/server/actions/stripe_subscription/mutation";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";
import { Icons } from "@/components/ui/icons";
import type { OrgSubscription } from "@/types/org-subscription";
import { getCheckoutURL } from "@/server/actions/stripe_subscription/query";
import { check } from "prettier";

type CancelAndPauseBtnProps = {
    subscription: OrgSubscription;
};

export function CancelPauseResumeBtns({
    subscription,
}: CancelAndPauseBtnProps) {
    const router = useRouter();

    const [, startAwaitableTransition] = useAwaitableTransition();

    const { isPending: isCancelling, mutate: cancelMutate } = useMutation({
        mutationFn: async () => {
            const response = await cancelPlan();
            await startAwaitableTransition(() => {
                router.refresh();
            });
            return response;
        },
        onError: () => {
            toast.error("Failed to cancel plan");
        },
        onSuccess: () => {
            toast.success("Plan cancelled successfully");
        },
    });

    const { isPending: isResuming, mutate: resumeMutate } = useMutation({
        mutationFn: async () => {
            const response = await handleResumePlan();
            if (typeof response !== "string") {
                await startAwaitableTransition(() => {
                    router.refresh();
                });
                toast.success("Plan resumed successfully!");
            }
            return response;
        },
        onError: () => {
            toast.error("Failed to resume plan");
        },
        onSuccess: (checkoutUrl) => {
            if (checkoutUrl && typeof checkoutUrl === "string") {
                router.push(checkoutUrl);
            }
        },
    });


    const handleResumePlan = async () => {
        if (!subscription || (subscription.ends_at && new Date(subscription.ends_at) < new Date())) {
            return await getCheckoutURL(subscription?.priceId);
        } else {
            return await resumePlan();
        }
    };

    const { isPending: isPausing, mutate: pauseMutate } = useMutation({
        mutationFn: async () => {
            const response = await pausePlan();
            await startAwaitableTransition(() => {
                router.refresh();
            });
            return response;
        },
        onError: () => {
            toast.error("Failed to pause plan");
        },
        onSuccess: () => {
            toast.success("Plan paused successfully");
        },
    });

    const isAllActionsPending = isCancelling || isResuming || isPausing;

    if (!subscription) return null;

    if (subscription.status === "active") {
        return (
            <div className="flex items-center gap-2">
                <Button
                    disabled={isAllActionsPending}
                    onClick={() => pauseMutate()}
                    variant="outline"
                >
                    {isPausing && <Icons.loader className="mr-2 h-4 w-4" />}
                    Pause Plan
                </Button>
                <Button
                    onClick={() => cancelMutate()}
                    disabled={isAllActionsPending}
                    variant="destructive"
                >
                    {isCancelling && <Icons.loader className="mr-2 h-4 w-4" />}
                    Cancel Plan
                </Button>
            </div>
        );
    }

    return (
        <Button
            disabled={isAllActionsPending}
            onClick={() => resumeMutate()}
            variant="outline"
        >
            {isResuming && <Icons.loader className="mr-2 h-4 w-4" />}
            Resume Plan
        </Button>
    );
}
