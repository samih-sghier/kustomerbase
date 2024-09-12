"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";

// Define schema for validation
const qnaSchema = z.object({
    qnaPairs: z.array(z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
    })),
});

export function QnAContent() {
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState([]);

    // Initialize the form with validation schema
    const form = useForm({
        resolver: zodResolver(qnaSchema),
        defaultValues: {
            qnaPairs: initialData,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "qnaPairs",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/get-qna"); // Adjust endpoint as needed
                const data = await response.json();
                setInitialData(data.qnaPairs || []);
                form.reset({ qnaPairs: data.qnaPairs || [] });
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchData();
    }, [form]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await fetch("/api/submit-qna", { // Adjust endpoint as needed
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            console.log(result); // Handle the response accordingly
        } catch (error) {
            console.error("Error submitting questions and answers:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-medium">Question & Answer</p>
                <div className="flex space-x-2">
                    <Button
                        type="button"
                        onClick={() => append({ question: "", answer: "" })}
                        variant="outline"
                    >
                        + Add Another Q&A Pair
                    </Button>
                    <Button type="submit" form="qna-form" disabled={loading}>
                        {loading ? "Processing..." : "Submit"}
                    </Button>
                </div>
            </div>

            {/* Form for multiple Q&A pairs */}
            <Form {...form}>
                <form
                    id="qna-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {fields.map((field, index) => (
                        <div key={field.id} className="space-y-4">
                            <FormField
                                control={form.control}
                                name={`qnaPairs.${index}.question`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question {index + 1}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your question here..."
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`qnaPairs.${index}.answer`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Answer {index + 1}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter your answer here..."
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                onClick={() => remove(index)}
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
