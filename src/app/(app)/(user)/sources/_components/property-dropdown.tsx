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
import { removePropertyMutation } from "@/server/actions/properties/mutation"; // Update this import path as needed
import { useMutation } from "@tanstack/react-query";
import { MoreVerticalIcon } from "lucide-react";
import { toast } from "sonner";
import { type propertySelectSchema } from "@/server/db/schema"; // Update this import path as needed
import type { z } from "zod";
import { useRouter } from "next/navigation";

type PropertyDropdownProps = z.infer<typeof propertySelectSchema>;

export function PropertyDropdown(props: PropertyDropdownProps) {
    const router = useRouter();

    const {
        mutateAsync: removePropertyMutate,
        isPending: isRemovePropertyPending,
    } = useMutation({
        mutationFn: () => removePropertyMutation({ id: props.id, orgId: props.organizationId }),
        onSettled: () => {
            router.refresh();
        },
    });

    const handleRemoveProperty = async () => {
        toast.promise(async () => removePropertyMutate(), {
            loading: "Removing property...",
            success: "Property removed successfully",
            error: "Failed to remove property",
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
                    disabled={isRemovePropertyPending}
                    onClick={handleRemoveProperty}
                    className="text-red-600"
                >
                    Remove
                </DropdownMenuItem>

                {/* You can add more items here, e.g., Edit, View Details */}
                {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
