"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { updateTextSourceField } from "@/server/actions/sources/mutations";
import { toast } from "sonner";

const textSchema = z.object({
    text: z.string().optional(),
});

export function TextContent({ source }: any) {
    const [loading, setLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(textSchema),
        defaultValues: {
            text: source?.text_source || "",
        },
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await updateTextSourceField(data.text);
        } catch (error) {
            toast.error("Error Submitting Text Source");
            console.error("Error submitting text:", error);
        } finally {
            toast.success("Text Source Updated");
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Text</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter your text here..."
                                    {...field}
                                    value={field.value || ""}
                                    className="h-80 w-full resize-none" // Increased height
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? "Processing..." : "Submit Text"}
                </Button>
            </form>
        </Form>
    );
}
