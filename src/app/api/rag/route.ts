import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { organizations, sources } from "@/server/db/schema";
import { VectorStoreIndex, Document } from "llamaindex";
import { getOrganizations } from "@/server/actions/organization/queries";
import { NextResponse } from 'next/server';

// Helper function to get organization data
async function getOrganizationData(orgId: string) {
  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });
    if (!org) throw new Error("Organization not found");

    const sourceData = await db.query.sources.findFirst({
      where: eq(sources.orgId, orgId),
    });
    return { org, sourceData };
  } catch (error) {
    console.error("Error fetching organization data:", error);
    throw new Error("Failed to fetch organization data");
  }
}

// Build LlamaIndex from source data
async function buildLlamaIndex(org: { name: string }, source: any): Promise<any> {
  const documents = [];

  // Handle different source types
  if (source.qa_source) {
    for (const [question, answer] of Object.entries(source.qa_source)) {
      documents.push({
        question,
        answer,
      });
    }
  }

  if (source.text_source) {
    documents.push({
      text: source.text_source,
    });
  }

  if (source.mail_source) {
    for (const [summary, body] of Object.entries(source.mail_source)) {
      documents.push({
        summary,
        body,
      });
    }
  }

  if (source.website_data) {
    for (const [url, content] of Object.entries(source.website_data)) {
      documents.push({
        url,
        content,
      });
    }
  }

  if (source.documents) {
    for (const [fileName, content] of Object.entries(source.documents)) {
      documents.push({
        fileName,
        content,
      });
    }
  }

  // Convert documents to LlamaIndex Document format
  const llamaDocuments = documents.map(doc => {
    if ('text' in doc) {
      return new Document({ text: doc.text });
    }
    // Add other conditions for different document types
    // Default case
    return new Document({ text: JSON.stringify(doc) });
  });

  // Build the LlamaIndex from the converted documents
  const index = await VectorStoreIndex.fromDocuments(llamaDocuments);

  return index;
}

// Save LlamaIndex to database
async function saveLlamaIndexToDb(orgId: string, index: any) {
  try {
    await db.update(sources).set({
      llamaIndex: index, // Store the serialized index
      lastTrained: new Date(),
    }).where(eq(sources.orgId, orgId));
  } catch (error) {
    console.error("Error saving LlamaIndex to database:", error);
    throw new Error("Failed to save LlamaIndex to database");
  }
}

// Main function to build and save index
async function createAndSaveLlamaIndex() {
  try {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) throw new Error("No organization ID found");
    
    const { org, sourceData } = await getOrganizationData(currentOrg.id);

    const index = await buildLlamaIndex(org, sourceData); // Build the LlamaIndex
    await saveLlamaIndexToDb(currentOrg.id, index); // Save index to database

    return { success: true, message: "LlamaIndex created and saved successfully." };
  } catch (error) {
    console.error("Error creating and saving LlamaIndex:", error);
    throw new Error("Failed to create and save LlamaIndex");
  }
}

export async function trainLlamaIndexForCurrentOrg() {
  try {
    const { success, message } = await createAndSaveLlamaIndex();
    return { success, message };
  } catch (error) {
    console.error("Error in trainLlamaIndexForCurrentOrg:", error);
    throw new Error("Failed to create LlamaIndex. Please try again later.");
  }
}

// Example usage (commented out):
// export async function exampleUsage() {
//   const result = await trainLlamaIndexForCurrentOrg();
//   console.log(result);
// }

export async function POST(request: Request) {
  try {
    const result = await trainLlamaIndexForCurrentOrg();
    
    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error training Vector Store index:', error);
    return NextResponse.json({ error: 'Failed to train Vector Store index' }, { status: 500 });
  }
}
