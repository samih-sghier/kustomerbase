"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";
import { useMutation } from '@tanstack/react-query';
import { Icons } from '@/components/ui/icons';
import { trainFineTunedModelForCurrentOrg } from '@/server/actions/training/mutation';

// Utility function for formatting large numbers with commas
export function formatNumberWithCommas(number: number) {
    return new Intl.NumberFormat().format(number);
}

interface SourceStats {
    textInputChars: number;
    linkChars: number;
    totalChars: number;
    linkCount: number;
    qaChars: number;
    qaCount: number;
    fileChars: number;
    fileCount: number;
    trainChatbot: boolean;
    lastTrainedDate: string | null;
}

export function SourcesCard({ stats }: { stats: SourceStats }) {
    const {
        textInputChars,
        linkChars,
        totalChars,
        linkCount,
        qaChars,
        qaCount,
        fileChars,
        fileCount,
        trainChatbot,
        lastTrainedDate
    } = stats;

    // Mutation to train the chatbot
    const { mutate: trainChatbotMutate, isPending: trainChatbotIsPending } = useMutation({
        mutationFn: async () => {
            // Call the API to train the chatbot
            return await trainFineTunedModelForCurrentOrg();
        },
        onSuccess: () => {
            toast.success('Chatbot training finished!');
        },
        onError: () => {
            toast.error('Error training chatbot!');
        }
    });

    const [trainBotIsTransitionPending, startAwaitableTrainBotTransition] = useAwaitableTransition();

    const onTrainBot = async () => {
        toast.promise(
            async () => {
                await startAwaitableTrainBotTransition(() => {
                    trainChatbotMutate(undefined); // Directly call the mutate function
                });
            },
            {
                loading: "Starting chatbot training...",
                success: "Chatbot training finished!",
                error: "Failed to start chatbot training.",
            }
        );
    };

    return (
        <Card className="w-full lg:w-100 shadow-md rounded-md border border-gray-200 bg-white p-4">
            <CardContent>
                <div className="text-sm font-medium mb-4">Sources</div>
                <div className="text-xs text-muted-foreground mb-3 space-y-2">
                    {fileCount > 0 && (
                        <p>{formatNumberWithCommas(fileCount)} File{fileCount !== 1 ? 's' : ''} ({formatNumberWithCommas(fileChars)} chars)</p>
                    )}
                    {textInputChars > 0 && (
                        <p>{formatNumberWithCommas(textInputChars)} text input chars</p>
                    )}
                    {linkCount > 0 && (
                        <p>{formatNumberWithCommas(linkCount)} Link{linkCount !== 1 ? 's' : ''} ({formatNumberWithCommas(linkChars)} detected chars)</p>
                    )}
                    {qaCount > 0 && (
                        <p>{formatNumberWithCommas(qaCount)} Q&A ({formatNumberWithCommas(qaChars)} chars)</p>
                    )}
                    <p className="font-bold text-lg">
                        {formatNumberWithCommas(totalChars)} / {formatNumberWithCommas(400000)} limit
                    </p>
                </div>

                <div className="text-xs text-muted-foreground mb-4">
                    {lastTrainedDate
                        ? `Last trained on: ${formatDate(lastTrainedDate)}`
                        : "Never been trained"}
                </div>

                {trainChatbot && lastTrainedDate && (
                    <div className="text-xs font-semibold text-red-500 mb-4">
                        Changes detected
                    </div>
                )}

                <Button
                    className="w-full"
                    disabled={!trainChatbot || trainChatbotIsPending || trainBotIsTransitionPending}
                    onClick={onTrainBot}
                >
                    {trainChatbotIsPending ? <Icons.loader className="h-4 w-4" /> :
                        (!lastTrainedDate ? "Train Chatbot" : "Retrain Chatbot")}
                </Button>
            </CardContent>
        </Card>
    );
}
