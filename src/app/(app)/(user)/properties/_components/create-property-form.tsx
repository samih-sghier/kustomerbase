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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { GooglePlacesInput } from "@/app/(app)/_components/google-places-input";
import { siteUrls } from "@/config/urls";

// Define the schema for the form including new fields
const createPropertyFormSchema = propertyInsertSchema.pick({
    title: true,
    description: true,
    address: true,
    price: true,
    status: true,
    organizationId: true,
    placeId: true,
    type: true,
    unitNumber: true,
    tenantCapacity: true
});

type CreatePropertyFormSchema = z.infer<typeof createPropertyFormSchema>;

// Async function to fetch status options
async function fetchCurrentOrganization() {
    const { currentOrg } = await getOrganizations();
    return currentOrg;
}

export function CreatePropertyForm() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [statusOptions, setStatusOptions] = useState<string[]>(["Available", "Leased", "Pending"]);
    const [currentOrganization, setCurrentOrganization] = useState<any>(undefined);

    // Initialize the form with default values and schema validation
    const form = useForm<CreatePropertyFormSchema>({
        resolver: zodResolver(createPropertyFormSchema),
        defaultValues: {
            title: "",
            description: "",
            address: "",
            price: undefined,
            status: "Available",
            organizationId: currentOrganization?.id ?? "",
            type: "Apartment",
            placeId: "",
            unitNumber: "",
            tenantCapacity: undefined
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
            // Convert price and tenantCapacity to numbers before submission
            const formattedData = {
                ...data,
                price: data.price ? Number(data.price) : undefined,
                tenantCapacity: data.tenantCapacity ? Number(data.tenantCapacity) : undefined,
                currentOrganization: currentOrganization?.id,
                organizationId: currentOrganization?.id

            };
            await mutateAsync(formattedData);

            await startAwaitableTransition(() => {
                router.refresh();
            });

            form.reset();
            setIsOpen(false);

            toast.success("Property created successfully");
        } catch (error) {
            const errorMessage = (error as { message?: string })?.message ?? "Failed to create property";

            if (errorMessage.includes("Please upgrade")) {
                toast.error("Your current plan does not allow this action. Please upgrade your plan.");
                router.push(siteUrls.organization.plansAndBilling); // Redirect to the upgrade page
            } else {
                toast.error(errorMessage);
            }
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
            <DialogContent className="max-h-screen overflow-auto">
                <DialogHeader>
                    <DialogTitle>Create a New Property for {currentOrganization?.name}</DialogTitle>
                    <DialogDescription>
                        Please provide the details of the property you want to create.
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
                                    <FormLabel>Label</FormLabel>
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
                                <GooglePlacesInput
                                    {...field}
                                    name="address"
                                    control={form.control}
                                    label="Address"
                                    description="Provide the address where the property is situated."
                                />
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rent</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Price of the property"
                                                type="number"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value ? parseFloat(value) : undefined);
                                                }}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the monthly rent.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tenantCapacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tenant Capacity</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Maximum number of tenants"
                                                type="number"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value ? parseInt(value) : undefined);
                                                }}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter number of tenants.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select property type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Apartment">Apartment</SelectItem>
                                                    <SelectItem value="Condominium">Condominium</SelectItem>
                                                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                                                    <SelectItem value="Studio Apartment">Studio Apartment</SelectItem>
                                                    <SelectItem value="Loft">Loft</SelectItem>
                                                    <SelectItem value="Duplex">Duplex</SelectItem>
                                                    <SelectItem value="Multi-Family Home">Multi-Family Home</SelectItem>
                                                    {/* Add more types as needed */}
                                                </SelectContent>

                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Select the type of the property.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unitNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Unit number or house number"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the unit number or house number of the property.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
