"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

const textSchema = z.object({
    text: z.string().min(1, "Text is required"),
});

export function TextContent() {
    const [loading, setLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(textSchema),
        defaultValues: {
            text: "",
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await fetch("/api/submit-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: data.text }),
            });
            const result = await response.json();
            console.log(result); // Handle the response accordingly
        } catch (error) {
            console.error("Error submitting text:", error);
        } finally {
            setLoading(false);
            form.reset();
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
