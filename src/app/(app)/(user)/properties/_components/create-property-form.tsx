"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";
import { createPropertyMutation } from "@/server/actions/properties/mutation";
import { propertyInsertSchema } from "@/server/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { getOrganizations } from "@/server/actions/organization/queries";

// Define the schema for the form
const createPropertyFormSchema = propertyInsertSchema.pick({
    title: true,
    description: true,
    address: true,
    price: true,
    status: true,
    organizationId: true
});

type CreatePropertyFormSchema = z.infer<typeof createPropertyFormSchema>;

// Async function to fetch status options
async function fetchCurrentOrganization() {
    // Replace with your async call to fetch options
    // For example, it could be a call to an API endpoint
    // return fetch('/api/status-options').then(res => res.json());
    const { currentOrg } = await getOrganizations();
    return currentOrg;
}

export function CreatePropertyForm() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [statusOptions, setStatusOptions] = useState<string[]>(["Available", "Under Contract", "Pending"]); // State for status options

    const [currentOrganization, setCurrentOrganization] = useState<any>(undefined); // State for status options

    // Initialize the form with default values and schema validation
    const form = useForm<CreatePropertyFormSchema>({
        resolver: zodResolver(createPropertyFormSchema),
        defaultValues: {
            title: "",
            description: "",
            address: "",
            price: undefined,
            status: "Available",
            organizationId: ""
        },
    });

    // Fetch status options when component mounts
    useEffect(() => {
        async function loadStatusOptions() {
            try {
                const currOrg = await fetchCurrentOrganization();
                setCurrentOrganization(currOrg);
            } catch (error) {
                toast.error("Failed to load current organization.");
            }
        }
        loadStatusOptions();
    }, []);

    const { isPending: isMutatePending, mutateAsync } = useMutation({
        mutationFn: (data: CreatePropertyFormSchema) => createPropertyMutation(data),
    });

    const [isPending, startAwaitableTransition] = useAwaitableTransition();

    const onSubmit = async (data: CreatePropertyFormSchema) => {

        try {
            // Convert price to a number before submission
            const formattedData = {
                ...data,
                price: data.price ? Number(data.price) : undefined,
                currentOrganization: currentOrganization?.id
            };

            await mutateAsync(formattedData);

            await startAwaitableTransition(() => {
                router.refresh();
            });

            form.reset();
            setIsOpen(false);

            toast.success("Property created successfully");
        } catch (error) {
            toast.error(
                (error as { message?: string })?.message ??
                "Failed to create property"
            );
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(o) => {
                form.reset();
                setIsOpen(o);
            }}
        >
            <DialogTrigger asChild>
                <Button type="button">Create Property</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Property for {currentOrganization?.name}</DialogTitle>
                    <DialogDescription>
                        Please provide the details of the property you want to
                        create.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid w-full gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Title of the property"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide a title for the property.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Address of the property"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide the address where the property is situated.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Price of the property"
                                            type="number"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Convert the value to a number if it's not empty
                                                field.onChange(value ? parseFloat(value) : undefined);
                                            }}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the price of the property.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Select the status of the property.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Description of the property"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide a detailed description of the property.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        disabled={isPending || isMutatePending}
                        onClick={form.handleSubmit(onSubmit)}
                        className="gap-2"
                    >
                        {isPending || isMutatePending ? (
                            <Icons.loader className="h-4 w-4" />
                        ) : null}
                        <span>Create Property</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
