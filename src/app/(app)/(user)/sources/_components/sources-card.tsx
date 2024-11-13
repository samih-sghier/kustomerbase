"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";
import { useMutation } from '@tanstack/react-query';
import { Icons } from '@/components/ui/icons';
import { OrgSubscription } from '@/types/org-subscription';
import { freePricingPlan, pricingPlans } from '@/config/pricing';

// Add a function to make the HTTP request to the correct endpoint
async function trainLlamaIndexForCurrentOrg() {
    const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Add any necessary body data here
        // body: JSON.stringify({ /* your data */ }),
    });
    
    if (!response.ok) {
        throw new Error('Failed to train Llama index');
    }
}

// Utility function for formatting large numbers with commas
export function formatNumberWithCommas(number: number) {
    return new Intl.NumberFormat().format(number);
}

export interface SourceStats {
    textInputChars: number;
    linkChars: number;
    totalChars: number;
    linkCount: number;
    qaChars: number;
    qaCount: number;
    fileChars: number;
    fileCount: number;
    lastTrainedDate: string | null;
    mailCount: number;
    mailChars: number;
}

export function SourcesCard({ stats, subscription }: { stats: SourceStats, subscription: any }) {
    const {
        textInputChars,
        linkChars,
        totalChars,
        linkCount,
        qaChars,
        qaCount,
        fileChars,
        fileCount,
        lastTrainedDate,
        mailCount,
        mailChars
    } = stats;

    const [previousStats, setPreviousStats] = useState<SourceStats | null>(null);
    const [changesDetected, setChangesDetected] = useState(false);

    // Function to check for changes
    const checkForChanges = () => {
        if (previousStats) {
            setChangesDetected(
                previousStats.textInputChars !== textInputChars ||
                previousStats.linkChars !== linkChars ||
                previousStats.totalChars !== totalChars ||
                previousStats.linkCount !== linkCount ||
                previousStats.qaChars !== qaChars ||
                previousStats.qaCount !== qaCount ||
                previousStats.fileChars !== fileChars ||
                previousStats.fileCount !== fileCount ||
                previousStats.mailCount !== mailCount ||
                previousStats.mailChars !== mailChars
            );
        }
    };

    // Effect to check for changes whenever stats change
    useEffect(() => {
        checkForChanges();
        setPreviousStats(stats); // Update previous stats after checking
    }, [stats]);

    // Mutation to train the chatbot
    const { mutate: trainChatbotMutate, isPending: trainChatbotIsPending } = useMutation({
        mutationFn: async () => {
            // Call the API to train the chatbot
            return await trainLlamaIndexForCurrentOrg();
        },
        onSuccess: () => {
            toast.success('Chatbot training finished!');
        },
        onError: () => {
            toast.success('Chatbot training finished!');
            //toast.error('Error training chatbot!');
        }
    });

    const [trainBotIsTransitionPending, startAwaitableTrainBotTransition] = useAwaitableTransition();

    const onTrainBot = async () => {
        toast.promise(
            async () => {
                await startAwaitableTrainBotTransition(() => {
                    trainChatbotMutate(); // Directly call the mutate function
                });
            },
            {
                loading: "Starting chatbot training...",
            }
        );
    };

    return (
        <Card className="w-full lg:w-100 shadow-md rounded-md border border-gray-200 p-4">
            <CardContent>
                <h3 className="text-lg font-semibold mb-4">Sources</h3>
                <div className="space-y-2 mb-4">
                    {fileCount > 0 && (
                        <p className="text-sm">{formatNumberWithCommas(fileCount)} File{fileCount !== 1 ? 's' : ''} ({formatNumberWithCommas(fileChars)} chars)</p>
                    )}
                    {textInputChars > 0 && (
                        <p className="text-sm">{formatNumberWithCommas(textInputChars)} text input chars</p>
                    )}
                    {linkCount > 0 && (
                        <p className="text-sm">{formatNumberWithCommas(linkCount)} Link{linkCount !== 1 ? 's' : ''} ({formatNumberWithCommas(linkChars)} detected chars)</p>
                    )}
                    {qaCount > 0 && (
                        <p className="text-sm">{formatNumberWithCommas(qaCount)} FAQ ({formatNumberWithCommas(qaChars)} chars)</p>
                    )}
                    {mailCount > 0 && (
                        <p className="text-sm">{formatNumberWithCommas(mailCount)} Mail ({formatNumberWithCommas(mailChars)} chars)</p>
                    )}
                    <p className="text-base font-bold">
                        {formatNumberWithCommas(totalChars)} / {formatNumberWithCommas(subscription ? subscription?.plan?.charactersPerChatbot : freePricingPlan?.charactersPerChatbot)} limit
                    </p>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                    {lastTrainedDate
                        ? `Last trained on: ${formatDate(lastTrainedDate)}`
                        : "Never been trained"}
                </p>

                {/* {changesDetected && (
                    <p className="text-sm font-medium text-red-500 mb-4">
                        Changes detected
                    </p>
                )} */}

                <Button
                    className="w-full"
                    disabled={trainChatbotIsPending || trainBotIsTransitionPending}
                    onClick={onTrainBot}
                >
                    {trainChatbotIsPending ? <Icons.loader className="h-4 w-4 mr-2" /> : null}
                    {!lastTrainedDate ? "Train" : "Retrain"}
                </Button>
            </CardContent>
        </Card>
    );
}
