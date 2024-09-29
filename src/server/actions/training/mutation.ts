"use server";

import OpenAI from "openai";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { organizations, sources } from "@/server/db/schema";
import { Readable } from "stream";
import { getOrganizations } from "../organization/queries";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getOrganizationData(orgId: string) {
  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });
    if (!org) throw new Error("Organization not found");
    
    const sourceData = await db.query.sources.findMany({
      where: eq(sources.orgId, orgId),
    });
    return { org, sourceData };
  } catch (error) {
    console.error("Error fetching organization data:", error);
    throw new Error("Failed to fetch organization data");
  }
}

async function prepareFineTuningData(org: any, sourceData: any) {
  const data = [];
  for (const source of sourceData) {
    data.push({
      messages: [
        { role: "system", content: `You are an AI assistant for ${org.name}.` },
        { role: "user", content: "Tell me about our company." },
        { role: "assistant", content: source.content },
      ],
    });
  }
  return data;
}

import fs from 'fs';
import path from 'path';

async function uploadDataToOpenAI(data: any) {
  try {
    // Convert data to JSONL format
    const jsonlData = data.map(JSON.stringify).join('\n');
    
    // Write JSONL data to a temporary file
    const tempFilePath = path.join(process.cwd(), 'temp_training_data.jsonl');
    fs.writeFileSync(tempFilePath, jsonlData);

    // Create a ReadStream from the file
    const file = fs.createReadStream(tempFilePath);

    const uploadedFile = await openai.files.create({
      file: file,
      purpose: "fine-tune"
    });

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    return uploadedFile.id;
  } catch (error) {
    console.error("Error details:", error);
    throw new Error("Failed to upload data to OpenAI");
  }
}

async function startFineTuningJob(fileId: string) {
  try {
    const fineTune = await openai.fineTuning.jobs.create({
      training_file: fileId,
      model: "gpt-3.5-turbo",
    });
    return fineTune.id;
  } catch (error) {
    console.error("Error starting fine-tuning job:", error);
    throw new Error("Failed to start fine-tuning job");
  }
}

async function pollJobStatus(jobId: string) {
  const maxAttempts = 60;
  const delayMs = 10000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const job = await openai.fineTuning.jobs.retrieve(jobId);
      if (job.status === "succeeded") {
        return job.fine_tuned_model;
      }
      if (job.status === "failed") {
        throw new Error("Fine-tuning job failed");
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error("Error polling job status:", error);
      throw new Error("Failed to poll job status");
    }
  }
  throw new Error("Timeout waiting for fine-tuning job to complete");
}

async function updateOrganizationModel(orgId: string, modelId: string | null) {
  try {
    await db.update(sources).set({
      modelId: modelId,
      lastTrained: new Date(),
    }).where(eq(sources.orgId, orgId));
  } catch (error) {
    console.error("Error updating organization model:", error);
    throw new Error("Failed to update organization model");
  }
}

async function fineTuneModel() {
  const { currentOrg, userOrgs } = await getOrganizations();

  if (!currentOrg) throw new Error("No organization ID found");
  const orgId = currentOrg?.id;

  const { org, sourceData } = await getOrganizationData(currentOrg.id);

  try {
    const data = await prepareFineTuningData(org, sourceData);
    const fileId = await uploadDataToOpenAI(data);
    const jobId = await startFineTuningJob(fileId);
    const modelId = await pollJobStatus(jobId);
    console.log("trained modelId", modelId);
    await updateOrganizationModel(orgId, modelId);
    return modelId;
  } catch (error) {
    console.error("Error in fineTuneModel:", error);
    throw new Error("Failed to fine-tune model"); // Make sure to re-throw or handle appropriately
  }
}

export async function trainFineTunedModelForCurrentOrg() {
  try {
    const modelId = await fineTuneModel();
    return { success: true, modelId };
  } catch (error) {
    console.error("Error in trainFineTunedModelForCurrentOrg:", error);
    throw new Error("Failed to train bot!"); // Make sure to re-throw or handle appropriately
  }
}

// Example usage (commented out):
// export async function exampleUsage() {
//   const result = await trainFineTunedModelForCurrentOrg();
//   console.log(result);
// }