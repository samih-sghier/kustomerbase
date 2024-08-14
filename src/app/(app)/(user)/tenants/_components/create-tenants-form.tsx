"use client";

import { GooglePlacesInput } from "@/app/(app)/_components/google-places-input";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";
import { getOrganizations } from "@/server/actions/organization/queries";
import { createTenantMutation } from "@/server/actions/tenants/mutation";
import { tenantInsertSchema } from "@/server/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

// Define the schema for the form
const createTenantFormSchema = tenantInsertSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    address: true,
    status: true,
    type: true,
    organizationId: true,
});

type CreateTenantFormSchema = z.infer<typeof createTenantFormSchema>;

async function fetchCurrentOrganization() {
    const { currentOrg } = await getOrganizations();
    return currentOrg;
}

export function CreateTenantForm() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [currentOrganization, setCurrentOrganization] = useState<any>(undefined);

    const form = useForm<CreateTenantFormSchema>({
        resolver: zodResolver(createTenantFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            status: "Active",
            type: "Individual",
            organizationId: currentOrganization?.id ?? "",
        },
    });

    useEffect(() => {
        async function loadCurrentOrganization() {
            try {
                const currOrg = await fetchCurrentOrganization();
                setCurrentOrganization(currOrg);
                form.setValue("organizationId", currOrg?.id ?? "");
            } catch (error) {
                toast.error("Failed to load current organization.");
            }
        }
        loadCurrentOrganization();
    }, []);

    const { isPending: isMutatePending, mutateAsync } = useMutation({
        mutationFn: (data: CreateTenantFormSchema) => createTenantMutation(data),
    });

    const [isPending, startAwaitableTransition] = useAwaitableTransition();

    const onSubmit = async (data: CreateTenantFormSchema) => {
        try {
            // Convert price and tenantCapacity to numbers before submission
            const formattedData = {
                ...data,
                organizationId: currentOrganization?.id
            };
            await mutateAsync(formattedData);

            await startAwaitableTransition(() => {
                router.refresh();
            });

            form.reset();
            setIsOpen(false);

            toast.success("Tenant created successfully");
        } catch (error) {
            toast.error(
                (error as { message?: string })?.message ?? "Failed to create tenant"
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
                <Button type="button">Create Tenant</Button>
            </DialogTrigger>
            <DialogContent className="max-h-screen overflow-auto">
                <DialogHeader>
                    <DialogTitle>Create a New Tenant for {currentOrganization?.name}</DialogTitle>
                    <DialogDescription>
                        Please provide the details of the tenant you want to add.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid w-full gap-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Tenant's first name"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide the tenant's first name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Tenant's last name"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide the tenant's last name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Tenant's email address"
                                                type="email"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide the tenant's email address.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Tenant's phone number"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide the tenant's phone number.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <GooglePlacesInput
                                    {...field}
                                    name="address"
                                    control={form.control}
                                    label="Current Address"
                                    description="Provide the address where the property is situated."
                                />
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
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
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Select the current status of the tenant.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Individual">Individual</SelectItem>
                                                    <SelectItem value="Corporate">Corporate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Select the type of tenant.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                        <span>Create</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
