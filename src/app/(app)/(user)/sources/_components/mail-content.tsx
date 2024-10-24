"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { updateMailSourceField, removeMailSourceField } from '@/server/actions/sources/mutations';

// Update the schema
const mailSchema = z.object({
    mailSamples: z.array(z.object({
        description: z.string().min(1, "Brief description is required"),
        value: z.string().min(1, "Email value is required"),
    })),
});

type MailSample = z.infer<typeof mailSchema>['mailSamples'][number];

interface Source {
    mail_source: Record<string, string> | null;
}

export function MailContent({ source, stats, subscription }: { source: Source, stats: any, subscription: any }) {
    const [loading, setLoading] = useState(false);
    const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set());

    // Transform source.mail_source into the format expected by the form
    const transformedInitialData = React.useMemo(() => {
        if (!source?.mail_source) {
            return [];
        }

        return Object.entries(source.mail_source).map(([description, value]) => ({
            key: description,
            description,
            value
        }));
    }, [source?.mail_source]);

    // Initialize the form with validation schema
    const form = useForm<z.infer<typeof mailSchema>>({
        resolver: zodResolver(mailSchema),
        defaultValues: {
            mailSamples: transformedInitialData,
        },
    });

    // Initialize form with existing data on component mount
    useEffect(() => {
        form.reset({ mailSamples: transformedInitialData });
    }, [transformedInitialData, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "mailSamples",
    });

    const onSubmit = async (data: z.infer<typeof mailSchema>) => {
        setLoading(true);
        try {
            if (!data.mailSamples || !Array.isArray(data.mailSamples)) {
                throw new Error('Invalid form data: mailSamples is not an array');
            }

            const mailSourceUpdate: Record<string, string> = {};
            let newMailChars = 0;

            data.mailSamples.forEach((sample, index) => {
                if (!sample || typeof sample !== 'object') {
                    console.error(`Invalid sample at index ${index}:`, sample);
                    return; // Skip this invalid sample
                }

                const { description, value } = sample;

                if (typeof description !== 'string' || typeof value !== 'string') {
                    console.error(`Invalid description or value at index ${index}:`, { description, value });
                    return; // Skip this invalid sample
                }

                mailSourceUpdate[description] = value;
                newMailChars += description.length + value.length;
            });


            // Check if stats and subscription are defined
            if (stats && subscription) {
                // Check character limit
                const currentTotalChars = stats.totalChars || 0;
                const currentMailChars = stats.mailChars || 0;
                const newTotalChars = (currentTotalChars - currentMailChars) + newMailChars;
                
                if (newTotalChars > subscription.charactersPerChatbot) {
                    toast.error(`Mail content exceeds the character limit for your subscription. Current total: ${currentTotalChars}, New mail total: ${newMailChars}, Limit: ${subscription.charactersPerChatbot}`);
                    setLoading(false);
                    return;
                }
            } else {
                console.warn('Stats or subscription data is missing. Skipping character limit check.');
            }

            console.log('Updating mail source field:', mailSourceUpdate);
            const updateResult = await updateMailSourceField(mailSourceUpdate);
            console.log('Update result:', updateResult);

            // Process removals
            if (removedKeys.size > 0) {
                console.log('Removing keys:', Array.from(removedKeys));
                const removeResult = await removeMailSourceField(removedKeys);
                console.log('Remove result:', removeResult);
                setRemovedKeys(new Set());
            }

            toast.success("Sample emails updated successfully!");
        } catch (error) {
            console.error("Detailed error updating sample emails:", error);
            if (error instanceof Error) {
                toast.error(`Error updating sample emails: ${error.message}`);
            } else {
                toast.error("An unexpected error occurred while updating sample emails.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (index: number, description: string) => {
        // Update removedKeys state
        setRemovedKeys(prev => {
            const updated = new Set(prev);
            updated.add(description); 
            return updated;
        });

        // Remove item from the form array
        remove(index);
        removeMailSourceField(new Set([description]));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold">Sample Emails for Training</p>
                <div className="flex space-x-2">
                    <Button
                        type="button"
                        onClick={() => append({ key: `new_${Date.now()}`, subject: "", value: "" })}
                        variant="outline"
                    >
                        + Add Sample Email
                    </Button>
                    <Button type="submit" form="mail-form" disabled={loading}>
                        {loading ? "Processing..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form
                    id="mail-form"
                    onSubmit={form.handleSubmit(onSubmit, (errors) => {
                        console.error('Form validation errors:', errors);
                    })}
                    className="space-y-4"
                >
                    {fields.map((field, index) => (
                        <div key={field.id} className="space-y-4 p-4 border rounded-md">
                            <FormField
                                control={form.control}
                                name={`mailSamples.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brief Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter brief description of the email..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`mailSamples.${index}.value`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Value</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter email value..."
                                                {...field}
                                                rows={5}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                onClick={() => handleRemove(index, fields[index].description)}
                                variant="outline"
                                className="text-red-600"
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </form>
            </Form>
        </div>
    );
}