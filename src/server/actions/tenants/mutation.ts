"use server";

import { db } from "@/server/db";
import {
    tenant,
    tenantInsertSchema,
    tenantUpdateSchema
} from "@/server/db/schema";
import { adminProcedure, protectedProcedure } from "@/server/procedures";
import { asc, count, desc, eq, ilike, inArray, or, and } from "drizzle-orm";
import type { z } from "zod";
import { getOrganizations } from "../organization/queries";

/**
 * Create a new tenant
 * @params firstName - The first name of the tenant
 * @params lastName - The last name of the tenant
 * @params email - The email of the tenant
 * @params status - The status of the tenant
 * @params phone - The phone number of the tenant (optional)
 * @params organizationId - The ID of the organization owning the tenant
 */
const tenantFormSchema = tenantInsertSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    status: true,
    phone: true,
    type: true,
    address: true,
    organizationId: true
});

type CreateTenantProps = z.infer<typeof tenantFormSchema>;

export async function createTenantMutation(props: CreateTenantProps) {
    // Ensure the user is authenticated and fetch organizations
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    // Validate the tenant data against the schema
    const tenantParse = await tenantFormSchema.safeParseAsync(props);

    if (!tenantParse.success) {
        throw new Error("Invalid tenant data", {
            cause: tenantParse.error.errors,
        });
    }

    // Insert or update the tenant in the database
    return await db
        .insert(tenant)
        .values({
            ...tenantParse.data,
            organizationId: currentOrg.id, // Ensure to include the currentOrgId
        })
        .onConflictDoUpdate({
            target: tenant.id,
            set: {
                ...tenantParse.data,
                organizationId: currentOrg.id, // Ensure to include organizationId in the update
            },
        })
        .execute();
}

/**
 * Remove a tenant
 * @params id - The ID of the tenant
 * @params orgId - The ID of the organization
 */
export async function removeTenantMutation({ id, orgId }: { id: string, orgId: string }) {
    const { user } = await protectedProcedure();

    // Check if id is provided
    if (!id) {
        console.error("Invalid tenant id");
        throw new Error("Invalid tenant id");
    }

    // Fetch the tenant data to ensure it exists and belongs to the organization
    const tenantData = await db.query.tenant.findFirst({
        where: and(eq(tenant.id, id), eq(tenant.organizationId, orgId)),
    });

    // If no tenant data is found, throw an error
    if (!tenantData) {
        console.error("Tenant not found or does not belong to the organization");
        throw new Error("Tenant not found or does not belong to the organization");
    }

    // Perform the deletion
    try {
        await db.delete(tenant).where(eq(tenant.id, id)).execute();
        console.log(`Tenant with ID ${id} removed successfully`);
    } catch (error) {
        console.error(`Failed to remove tenant with ID ${id}:`, error);
        throw new Error("Failed to remove tenant");
    }
}

/**
 * Update a tenant
 * @params id - The ID of the tenant
 * @params firstName - The new first name of the tenant (optional)
 * @params lastName - The new last name of the tenant (optional)
 * @params email - The new email of the tenant (optional)
 * @params status - The new status of the tenant (optional)
 * @params phone - The new phone number of the tenant (optional)
 */
const tenantUpdateFormSchema = tenantUpdateSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    status: true,
    phone: true,
});

type UpdateTenantProps = z.infer<typeof tenantUpdateFormSchema>;

export async function updateTenantMutation(props: UpdateTenantProps) {
    await adminProcedure();

    const tenantParse = await tenantUpdateFormSchema.safeParseAsync(props);

    if (!tenantParse.success) {
        throw new Error("Invalid tenant data", {
            cause: tenantParse.error.errors,
        });
    }

    return await db
        .update(tenant)
        .set(tenantParse.data)
        .where(eq(tenant.id, tenantParse.data.id))
        .execute();
}

/**
 * Edit a tenant's details
 * @params id - The ID of the tenant
 * @params firstName - The updated first name of the tenant (optional)
 * @params lastName - The updated last name of the tenant (optional)
 * @params email - The updated email of the tenant (optional)
 * @params status - The updated status of the tenant (optional)
 * @params phone - The updated phone number of the tenant (optional)
 */
const tenantEditFormSchema = tenantUpdateSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    status: true,
    phone: true,
});

type EditTenantProps = z.infer<typeof tenantEditFormSchema>;

export async function editTenantMutation(props: EditTenantProps) {
    await adminProcedure();

    const tenantParse = await tenantEditFormSchema.safeParseAsync(props);

    if (!tenantParse.success) {
        throw new Error("Invalid tenant data", {
            cause: tenantParse.error.errors,
        });
    }

    return await db
        .update(tenant)
        .set({
            firstName: tenantParse.data.firstName,
            lastName: tenantParse.data.lastName,
            email: tenantParse.data.email,
            status: tenantParse.data.status,
            phone: tenantParse.data.phone,
        })
        .where(eq(tenant.id, tenantParse.data.id))
        .execute();
}
