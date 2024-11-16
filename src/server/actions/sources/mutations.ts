// Imports and setup
"use server";

import { db } from "@/server/db";
import { sources, sourcesInsertSchema, sourcesUpdateSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { protectedProcedure, adminProcedure } from "@/server/procedures";
import { getOrganizations } from "../organization/queries";
import { revalidatePath, revalidateTag } from "next/cache";
import { now } from "next-auth/client/_utils";

// Helper function to ensure a default source exists
async function ensureDefaultSourceExists(orgId: string) {
    const existingSource = await db.query.sources.findFirst({
        where: eq(sources.orgId, orgId),
    });

    if (!existingSource) {
        await db.insert(sources).values({
            orgId,
            qa_source: null,
            text_source: null,
            website_data: null,
            documents: null,
            createdAt: new Date(),
            updatedOn: new Date(),
        }).execute();

    }

}

// Function to create a source
export async function createSource(props: z.infer<typeof sourcesInsertSchema>) {
    // Ensure the user is authenticated
    const { user } = await protectedProcedure();

    // Fetch the current organization
    const { currentOrg } = await getOrganizations();

    // Ensure a default source exists for the organization
    await ensureDefaultSourceExists(currentOrg.id);

    // Validate the source data
    const validationResult = sourcesInsertSchema.safeParse(props);
    if (!validationResult.success) {
        throw new Error("Invalid source data");
    }
    revalidatePath('/sources');
    // Insert the source
    return await db
        .insert(sources)
        .values({
            ...validationResult.data,
            orgId: currentOrg.id
        })
        .onConflictDoNothing() // Adjust conflict handling as necessary
        .execute();
}

export async function updateDocumentsField(documentsUpdate: Record<string, string>) {
    // Ensure the user is authenticated
    // Fetch the current organization
    const { currentOrg } = await getOrganizations();

    // Ensure a default source exists for the organization
    await ensureDefaultSourceExists(currentOrg.id);

    // Fetch the existing record
    const existingRecord = await db
        .select()
        .from(sources)
        .where(eq(sources.orgId, currentOrg.id))
        .limit(1)
        .execute();

    if (!existingRecord || existingRecord.length === 0) {
        throw new Error("No source record found for the current organization.");
    }

    const currentRecord = existingRecord[0];

    // Prepare the updated documents field
    const updatedDocuments = {
        ...(currentRecord?.documents || {}), // Ensure currentRecord?.documents is not null or undefined
        ...documentsUpdate || {}
    };



    // Update the source record with the new documents field
    await db
        .update(sources)
        .set({ documents: updatedDocuments, updatedOn: new Date() })
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
    revalidatePath('/sources');


}


export async function updateLastTrainedTimeStamp() {
    // Ensure the user is authenticated
    // Fetch the current organization
    const { currentOrg } = await getOrganizations();

    // Ensure a default source exists for the organization
    await ensureDefaultSourceExists(currentOrg.id);

    // Fetch the existing record
    const existingRecord = await db
        .select()
        .from(sources)
        .where(eq(sources.orgId, currentOrg.id))
        .limit(1)
        .execute();

    if (!existingRecord || existingRecord.length === 0) {
        throw new Error("No source record found for the current organization.");
    }

    await db
        .update(sources)
        .set({ lastTrained: new Date(), updatedOn: new Date() })
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
    revalidatePath('/sources');


}


export async function removeDocumentsField(documentNames: Set<string>) {
    // Ensure the user is authenticated
    // Fetch the current organization
    const { currentOrg } = await getOrganizations();

    // Ensure a default source exists for the organization
    await ensureDefaultSourceExists(currentOrg.id);

    // Fetch the existing record
    const existingRecord = await db
        .select()
        .from(sources)
        .where(eq(sources.orgId, currentOrg.id))
        .limit(1)
        .execute();

    if (!existingRecord || existingRecord.length === 0) {
        throw new Error("No source record found for the current organization.");
    }

    const currentRecord = existingRecord[0];

    // Prepare the updated documents field by removing specified documents
    const currentDocuments = currentRecord?.documents || {};
    const updatedDocuments = Object.fromEntries(
        Object.entries(currentDocuments).filter(([key]) => !documentNames.has(key))
    );

    // Update the source record with the new documents field
    await db
        .update(sources)
        .set({ documents: updatedDocuments, updatedOn: new Date() })
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
    revalidatePath('/sources');

}

// Function to update qa_source
export async function updateQaSourceField(qaSourceUpdate: Record<string, string>) {
    const { currentOrg } = await getOrganizations();
    await ensureDefaultSourceExists(currentOrg.id);

    const existingRecord = await db
        .select()
        .from(sources)
        .where(eq(sources.orgId, currentOrg.id))
        .limit(1)
        .execute();

    if (!existingRecord || existingRecord.length === 0) {
        throw new Error("No source record found for the current organization.");
    }

    const currentRecord = existingRecord[0];

    const updatedQaSource = {
        ...(currentRecord?.qa_source || {}),
        ...qaSourceUpdate
    };

    await db
        .update(sources)
        .set({ qa_source: updatedQaSource, updatedOn: new Date() })
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
    revalidatePath('/sources');

}

// Function to update website_data field
export async function updateWebsiteDataField(websiteDataUpdate: Record<string, string>) {
    const { currentOrg } = await getOrganizations();
    await ensureDefaultSourceExists(currentOrg.id);

    const existingRecord = await db
        .select()
        .from(sources)
        .where(eq(sources.orgId, currentOrg.id))
        .limit(1)
        .execute();

    if (!existingRecord || existingRecord.length === 0) {
        throw new Error("No source record found for the current organization.");
    }

    const currentRecord = existingRecord[0];

    const updatedWebsiteData = {
        ...(currentRecord?.website_data || {}),
        ...websiteDataUpdate
    };

    await db
        .update(sources)
        .set({ website_data: updatedWebsiteData, updatedOn: new Date() })
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
    revalidatePath('/sources');

}

// Function to update text_source field (assuming it stores large text data)
export async function updateTextSourceField(textSourceUpdate: string) {
    const { currentOrg } = await getOrganizations();
    await ensureDefaultSourceExists(currentOrg.id);

    await db
        .update(sources)
        .set({ text_source: textSourceUpdate, updatedOn: new Date() })
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
    revalidatePath('/sources');

}




// Function to clear specific fields of a source
export async function clearSourceFields(fieldsToClear: (keyof z.infer<typeof sourcesUpdateSchema>)[]) {
    // Ensure the user is authenticated
    const { user } = await protectedProcedure();

    // Fetch the current organization
    const { currentOrg } = await getOrganizations();

    // Ensure a default source exists for the organization
    await ensureDefaultSourceExists(currentOrg.id);

    // Construct the update object with specified fields set to null
    const updateObject: Partial<z.infer<typeof sourcesUpdateSchema>> = {};
    for (const field of fieldsToClear) {
        updateObject[field] = null;
    }

    // Update the source
    await db
        .update(sources)
        .set(updateObject)
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
}

// Function to remove a source
export async function removeSource(id: string) {
    if (!id) {
        throw new Error("Invalid source ID");
    }

    // Ensure the user is authenticated
    const { user } = await protectedProcedure();

    // Fetch the current organization
    const { currentOrg } = await getOrganizations();

    // Fetch the source data
    const source = await db.query.sources.findFirst({
        where: eq(sources.id, id)
    });

    if (!source || source.orgId !== currentOrg.id) {
        throw new Error("Source not found or does not belong to the organization");
    }

    // Delete the source
    await db.delete(sources).where(eq(sources.id, id)).execute();
}


// Function to remove specific qa_source entries
export async function removeQaSourceField(qaKeys: Set<string>) {
    const { currentOrg } = await getOrganizations();
    await ensureDefaultSourceExists(currentOrg.id);

    const existingRecord = await db
        .select()
        .from(sources)
        .where(eq(sources.orgId, currentOrg.id))
        .limit(1)
        .execute();

    if (!existingRecord || existingRecord.length === 0) {
        throw new Error("No source record found for the current organization.");
    }

    const currentRecord = existingRecord[0];
    const currentQaSource = currentRecord?.qa_source || {};
    const updatedQaSource = Object.fromEntries(
        Object.entries(currentQaSource).filter(([key]) => !qaKeys.has(key))
    );

    await db
        .update(sources)
        .set({ qa_source: updatedQaSource, updatedOn: new Date() })
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
    revalidatePath('/sources');

}

// Function to remove specific website_data entries
export async function removeWebsiteDataField(urls: Set<string>) {
    const { currentOrg } = await getOrganizations();
    await ensureDefaultSourceExists(currentOrg.id);

    const existingRecord = await db
        .select()
        .from(sources)
        .where(eq(sources.orgId, currentOrg.id))
        .limit(1)
        .execute();

    if (!existingRecord || existingRecord.length === 0) {
        throw new Error("No source record found for the current organization.");
    }

    const currentRecord = existingRecord[0];
    const currentWebsiteData = currentRecord?.website_data || {};
    const updatedWebsiteData = Object.fromEntries(
        Object.entries(currentWebsiteData).filter(([url]) => !urls.has(url))
    );

    await db
        .update(sources)
        .set({ website_data: updatedWebsiteData, updatedOn: new Date() })
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
    revalidatePath('/sources');

}

// Function to remove text_source (setting it to null)
export async function removeTextSourceField() {
    const { currentOrg } = await getOrganizations();
    await ensureDefaultSourceExists(currentOrg.id);

    await db
        .update(sources)
        .set({ text_source: null, updatedOn: new Date() })
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
    revalidatePath('/sources');

}

// Function to update mail_source field
export async function updateMailSourceField(mailSourceUpdate: Record<string, string>) {
    try {
        const { currentOrg } = await getOrganizations();
        if (!currentOrg) {
            throw new Error("Current organization not found");
        }

        await ensureDefaultSourceExists(currentOrg.id);

        const existingRecord = await db
            .select()
            .from(sources)
            .where(eq(sources.orgId, currentOrg.id))
            .limit(1)
            .execute();

        if (!existingRecord || existingRecord.length === 0) {
            throw new Error("No source record found for the current organization.");
        }

        const currentRecord = existingRecord[0];

        const updatedMailSource = {
            ...(currentRecord?.mail_source || {}),
            ...mailSourceUpdate
        };

        await db
            .update(sources)
            .set({ mail_source: updatedMailSource, updatedOn: new Date() })
            .where(eq(sources.orgId, currentOrg.id))
            .execute();

        revalidatePath('/sources');
    } catch (error) {
        console.error("Error in updateMailSourceField:", error);
        throw error;
    }
}

// Function to remove specific mail_source entries
export async function removeMailSourceField(keys: Set<string>) {
    const { currentOrg } = await getOrganizations();
    await ensureDefaultSourceExists(currentOrg.id);

    const existingRecord = await db
        .select()
        .from(sources)
        .where(eq(sources.orgId, currentOrg.id))
        .limit(1)
        .execute();

    if (!existingRecord || existingRecord.length === 0) {
        throw new Error("No source record found for the current organization.");
    }

    const currentRecord = existingRecord[0];
    const currentMailSource = currentRecord?.mail_source || {};
    const updatedMailSource = Object.fromEntries(
        Object.entries(currentMailSource).filter(([key]) => !keys.has(key))
    );

    await db
        .update(sources)
        .set({ mail_source: updatedMailSource, updatedOn: new Date() })
        .where(eq(sources.orgId, currentOrg.id))
        .execute();
    revalidatePath('/sources');
}