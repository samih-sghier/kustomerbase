"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
    DialogFooter,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Icons } from "@/components/ui/icons";
import { getOrganizations } from "@/server/actions/organization/queries";
import { alertTypeEnum, watchlistInsertSchema } from "@/server/db/schema"; // Adjust based on your schema
import { createWatchlistMutation } from "@/server/actions/watchlist/mutation";
import { getOrgPropertiesQuery } from "@/server/actions/properties/queries";
import { getOrgTenantsQuery } from "@/server/actions/tenants/queries";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";

// Define the schema for the form
const createWatchlistFormSchema = watchlistInsertSchema.pick({
    alertType: true,
    organizationId: true,
    propertyId: true,
    tenantId: true,
});

type CreateWatchlistFormSchema = z.infer<typeof createWatchlistFormSchema>;

async function fetchCurrentOrganization() {
    const { currentOrg } = await getOrganizations();
    return currentOrg;
}

async function fetchProperties(organizationId: string) {
    return await getOrgPropertiesQuery();
}

async function fetchTenants(organizationId: string) {
    return await getOrgTenantsQuery();
}

export function CreateWatchlistForm() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [currentOrganization, setCurrentOrganization] = useState<any>(undefined);

    const { data: properties, refetch: refetchProperties } = useQuery({
        queryKey: ["properties", currentOrganization?.id],
        queryFn: () => fetchProperties(currentOrganization?.id ?? ""),
        enabled: !!currentOrganization,
    });

    const { data: tenants, refetch: refetchTenants } = useQuery({
        queryKey: ["tenants", currentOrganization?.id],
        queryFn: () => fetchTenants(currentOrganization?.id ?? ""),
        enabled: !!currentOrganization,
    });

    const form = useForm<CreateWatchlistFormSchema>({
        resolver: zodResolver(createWatchlistFormSchema),
        defaultValues: {
            alertType: "Subleasing",
            organizationId: currentOrganization?.id ?? "",
            propertyId: "",
            tenantId: "",
        },
    });

    useEffect(() => {
        async function loadCurrentOrganization() {
            try {
                const currOrg = await fetchCurrentOrganization();
                setCurrentOrganization(currOrg);
                form.setValue("organizationId", currOrg?.id ?? "");
                await refetchProperties();
                await refetchTenants();
            } catch (error) {
                toast.error("Failed to load current organization.");
            }
        }
        loadCurrentOrganization();
    }, []);

    const { isPending: isMutatePending, mutateAsync } = useMutation({
        mutationFn: (data: CreateWatchlistFormSchema) => createWatchlistMutation(data),
    });
    const [isPending, startAwaitableTransition] = useAwaitableTransition();

    const onSubmit = async (data: CreateWatchlistFormSchema) => {
        try {
            console.log("Submitting data:", data);
            await mutateAsync({
                ...data,
                organizationId: currentOrganization?.id
            });
            await startAwaitableTransition(() => {
                router.refresh();
            });
            form.reset({
                alertType: "Subleasing",
                organizationId: currentOrganization?.id ?? "",
                propertyId: "",
                tenantId: "",
            });
            setIsOpen(false);
            toast.success("Watchlist item created successfully");
        } catch (error) {
            console.error("Submission error:", error);
            const errorMessage = error?.message || "Failed to create watchlist item";
            toast.error(errorMessage);
        }
    };



    const getPropertyLabel = (propertyId: string) => {
        const property = properties?.find(p => p.id === propertyId);
        return property ? `${property.title} (${property.address})` : '';
    };

    const getTenantLabel = (tenantId: string) => {
        const tenant = tenants?.find(t => t.id === tenantId);
        return tenant ? `${tenant.firstName} ${tenant.lastName}` : '';
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    form.reset();
                }
                setIsOpen(open);
            }}
        >
            <DialogTrigger asChild>
                <Button type="button">Create Item</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Watchlist Item</DialogTitle>
                    <DialogDescription>
                        Please provide the details of the watchlist item you want to add.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full gap-4">
                        <FormField
                            control={form.control}
                            name="alertType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alert Type</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select alert type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectContent>
                                                    {alertTypeEnum.enumValues.map((val) => (
                                                        <SelectItem key={val} value={val}>
                                                            {val}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>

                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>Select the type of alert.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="propertyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Property</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select property" >
                                                    {field.value ? getPropertyLabel(field.value) : 'Select property'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {properties?.map((property) => (
                                                    <SelectItem key={property.id} value={property.id}>
                                                        <div className="flex flex-col">
                                                            <span>{property.title}</span>
                                                            {property.unitNumber && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    Unit {property.unitNumber}
                                                                </span>
                                                            )}
                                                            <span className="text-sm text-muted-foreground">
                                                                {property.address}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>Select the property from the list.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tenantId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tenant</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select tenant" >
                                                    {field.value ? getTenantLabel(field.value) : 'Select tenant'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tenants?.map((tenant) => (
                                                    <SelectItem key={tenant.id} value={tenant.id}>
                                                        <div className="flex flex-col">
                                                            <span>{tenant.firstName} {tenant.lastName}</span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {tenant.email}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>Select the tenant from the list.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
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
                        <span>Create</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
