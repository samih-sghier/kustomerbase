"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeTenantMutation, editTenantMutation } from "@/server/actions/tenants/mutation"; // Update import paths as needed
import { useMutation } from "@tanstack/react-query";
import { MoreVerticalIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { tenantSelectSchema } from "@/server/db/schema"; // Update this import path as needed

type TenantDropdownProps = z.infer<typeof tenantSelectSchema>;

export function TenantDropdown(props: TenantDropdownProps) {
    const router = useRouter();

    const {
        mutateAsync: removeTenantMutate,
        isPending: isRemoveTenantPending,
    } = useMutation({
        mutationFn: () => removeTenantMutation({ id: props.id, orgId: props.organizationId }),
        onSettled: () => {
            router.refresh();
        },
    });

    const {
        mutateAsync: editTenantMutate,
        isPending: isEditTenantPending,
    } = useMutation({
        mutationFn: () => editTenantMutation({ id: props.id }),
        onSettled: () => {
            router.refresh();
        },
    });

    const handleRemoveTenant = async () => {
        toast.promise(async () => removeTenantMutate(), {
            loading: "Removing tenant...",
            success: "Tenant removed successfully",
            error: "Failed to remove tenant",
        });
    };

    const handleEditTenant = async () => {
        // This should ideally navigate to an edit form or modal
        toast.promise(async () => editTenantMutate(), {
            loading: "Editing tenant...",
            success: "Tenant updated successfully",
            error: "Failed to update tenant",
        });
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="absolute right-3 top-3 h-8 w-8 p-0"
                >
                    <span className="sr-only">Open menu</span>
                    <MoreVerticalIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-screen max-w-[12rem]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    disabled={isRemoveTenantPending}
                    onClick={handleRemoveTenant}
                    className="text-red-600"
                >
                    Remove
                </DropdownMenuItem>

                <DropdownMenuItem
                    disabled={isEditTenantPending}
                    onClick={handleEditTenant}
                >
                    Edit
                </DropdownMenuItem>

                {/* You can add more items here, e.g., View Details */}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
