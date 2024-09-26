"use server";

import { db } from "@/server/db";
import { organizations, sources } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { getOrganizations } from "../organization/queries";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to fetch organization and source data
async function getOrganizationData(orgId: string) {
    const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, orgId),
    });

    const source = await db.query.sources.findFirst({
        where: eq(sources.orgId, orgId),
    });

    return {
        name: org?.name,
        website: source?.website_data,
        qa_source: source?.qa_source,
        text_source: source?.text_source,
        documents: source?.documents,
    };
}

// Function to prepare fine-tuning data from the organization's sources
async function prepareFineTuningData(orgId: string) {
    const orgData = await getOrganizationData(orgId);

    // Prepare fine-tuning data using the organization data
    return [
        {
            prompt: `Organization: ${orgData.name}\nWebsite: ${JSON.stringify(orgData.website)}\nQA Source: ${JSON.stringify(orgData.qa_source)}\nText Source: ${orgData.text_source}\nDocuments: ${JSON.stringify(orgData.documents)}`,
            completion: "Provide a detailed response based on the above data."
        }
    ];
}

// Mutation to fine-tune model
export async function fineTuneModel() {
    const { currentOrg } = await getOrganizations();
    const orgId = currentOrg.id;

    const fineTuningData = await prepareFineTuningData(orgId);

    // Create JSONL string from the fine-tuning data
    const jsonlData = fineTuningData.map(entry => `${JSON.stringify(entry)}`).join('\n');
    const fileBlob = new Blob([jsonlData], { type: 'application/jsonl' }); // Create a Blob
    const file = new File([fileBlob], 'fine_tuning_data.jsonl', { type: 'application/jsonl', lastModified: Date.now() }); // Create a File

    // Create a file for fine-tuning
    const uploadedFile = await openai.files.create({
        file,
        purpose: "fine-tune",
    });

    // Start the fine-tuning job
    const job = await openai.fineTuning.jobs.create({
        training_file: uploadedFile.id,
        model: "gpt-3.5-turbo",
    });

    // Poll for job completion
    let completedJob;
    do {
        completedJob = await openai.fineTuning.jobs.retrieve(job.id);
    } while (completedJob.status !== "succeeded");

    // Update the modelId and lastTrained fields in the database
    await db
        .update(sources)
        .set({
            modelId: completedJob.fine_tuned_model,
            lastTrained: new Date(),
            updatedOn: new Date(),
        })
        .where(eq(sources.orgId, orgId))
        .execute();

    return completedJob.fine_tuned_model;
}

// Example mutation to train fine-tuned model for the current organization
export async function trainFineTunedModelForCurrentOrg() {
    try {
        const modelId = await fineTuneModel();
        console.log(`Fine-tuned model created with ID: ${modelId}`);
        return modelId;
    } catch (error) {
        console.error("Error during fine-tuning:", error);
        throw new Error("Fine-tuning process failed.");
    }
}

// // Example usage
// if (require.main === module) {
//     trainFineTunedModelForCurrentOrg();
// }
