"use server";

import { db } from "@/server/db";
import {
    membersToOrganizations,
    property,
    propertyInsertSchema,
    propertySelectSchema,
    propertyUpdateSchema,
} from "@/server/db/schema";
import { adminProcedure, protectedProcedure } from "@/server/procedures";
import { and, count, eq } from "drizzle-orm";
import type { z } from "zod";
import { getOrganizations } from "../organization/queries";
import { getOrgSubscription } from "../subscription/query";
import { pricingIds, pricingPlans } from "@/config/pricing";
import { redirect } from "next/navigation";

/**
 * Create a new property
 * @params title - The title of the property
 * @params address - The address of the property
 * @params status - The status of the property
 * @params description - The description of the property (optional)
 * @params organizationId - The ID of the organization owning the property
 */

const propertyFormSchema = propertyInsertSchema.pick({
    title: true,
    address: true,
    price: true,
    status: true,
    description: true,
    organizationId: true,
    placeId: true, // Ensure placeId is included and properly set
    type: true, // Add property type
    unitNumber: true, // Add unit or house number
    tenantCapacity: true // Add tenant capacity
});

type CreatePropertyProps = z.infer<typeof propertyFormSchema>;

export async function createPropertyMutation(props: CreatePropertyProps) {
    // Ensure the user is authenticated and fetch organizations
    const { user } = await protectedProcedure();
    const { currentOrg, userOrgs } = await getOrganizations();

    const subscription = await getOrgSubscription();

    // Validate the property data against the schema
    const propertyParse = await propertyFormSchema.safeParseAsync(props);

    if (!propertyParse.success) {
        console.log(propertyParse.error);
        throw new Error("Invalid property", {
            cause: propertyParse.error.errors,
        });
    }




    var currentOrgId = propertyParse.data.organizationId;

    // Usage example:
    if (!(await canPostProperty(subscription, currentOrgId))) {
        return new Response("Your current plan does not allow posting more properties. Please upgrade your plan.", { status: 400 });
    }        



    // Ensure the user has access to the organization (if applicable)
    // Search through userOrgs to find a match
    // const organization = userOrgs.find(org => org.id === currentOrgId);

    // if (!organization) {
    //     throw new Error("You don't belong to " + currentOrg.name);
    // }

    // Insert or update the property in the database
    return await db
        .insert(property)
        .values({
            ...propertyParse.data,
            organizationId: currentOrg.id, // Add the currentOrgId to the values
        })
        .onConflictDoUpdate({
            target: property.id,
            set: {
                ...propertyParse.data,
                organizationId: currentOrg.id,  // Ensure to include organizationId in the update
            },
        })
        .execute();
}


/**
 * Remove a property
 * @params id - The ID of the property
 */

/**
 * Remove a property
 * @params id - The ID of the property
 */
export async function removePropertyMutation({ id, orgId }: { id: string, orgId: string }) {
    const { user } = await protectedProcedure();

    // Check if id is provided
    if (!id) {
        console.error("Invalid property id");
        throw new Error("Invalid property id");
    }

    // Fetch the property data to ensure it exists and belongs to the user
    const propertyData = await db.query.property.findFirst({
        where: and(eq(property.id, id), eq(property.organizationId, orgId)),
    });

    // If no property data is found, throw an error
    if (!propertyData) {
        console.error("Property not found or does not belong to the user");
        throw new Error("Property not found or does not belong to the user");
    }

    // Perform the deletion
    try {
        await db.delete(property).where(eq(property.id, id)).execute();
    } catch (error) {
        console.error(`Failed to remove property with ID ${id}:`, error);
        throw new Error("Failed to remove property");
    }
}

/**
 * Update a property
 * @params id - The ID of the property
 * @params title - The new title of the property (optional)
 * @params address - The new address of the property (optional)
 * @params status - The new status of the property (optional)
 * @params description - The new description of the property (optional)
 */

const propertyUpdateFormSchema = propertyUpdateSchema.pick({
    id: true,
    title: true,
    address: true,
    status: true,
    description: true,
});

type UpdatePropertyProps = z.infer<typeof propertyUpdateFormSchema>;

export async function updatePropertyMutation(props: UpdatePropertyProps) {
    await adminProcedure();

    const propertyParse = await propertyUpdateFormSchema.safeParseAsync(props);

    if (!propertyParse.success) {
        throw new Error("Invalid property", {
            cause: propertyParse.error.errors,
        });
    }

    return await db
        .update(property)
        .set(propertyParse.data)
        .where(eq(property.id, propertyParse.data.id))
        .execute();
}

/**
 * Delete a property by ID
 * @params id - The ID of the property
 */

export async function deletePropertyMutation({ id }: { id: string }) {
    await adminProcedure();

    if (!id) throw new Error("Invalid property id");

    return await db.delete(property).where(eq(property.id, id)).execute();
}



const canPostProperty = async (subscription: any | null, currentOrgId: string): Promise<boolean> => {
    // Check if the subscription is active
    const isSubscriptionActive = () => {
        if (!subscription) return true; // Free plan is always active
        const currentDate = new Date();
        return subscription.status === 'active' || (subscription.status === 'cancelled' && subscription.ends_at && new Date(subscription.ends_at) > currentDate);
    };

    // Verify if the plan allows posting more properties
    const verifyPlan = async () => {
        const planId = subscription?.plan?.id || pricingIds.free; // Default to free plan if no subscription

        // Find the plan based on pricingIds
        const plan = pricingPlans.find(p => p.id === planId);

        if (!plan) return false;

        // Count the number of properties already posted by the organization
        const propertyCount = await db
            .select({ count: count() })
            .from(property)
            .where(eq(property.organizationId, currentOrgId))
            .execute()
            .then(res => res[0]?.count ?? 0);

        // Check if the current property count exceeds the limit
        return propertyCount < plan.propertiesLimit;
    };

    // Check if the user can post another property based on their plan
    return isSubscriptionActive() && await verifyPlan();
};

