// API route: accepts an uploaded document, asks Claude for a plain-English JSON explanation, returns parsed JSON.

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a calm, knowledgeable friend helping someone understand 
a confusing document they have received. Your job is to make 
them feel informed and reassured, not overwhelmed.

Explain the document as if talking to a smart 28-year-old with 
no legal or financial background. Never use jargon. If you must 
use a technical term, immediately explain it in brackets.

Return your response as valid JSON only, with no extra text, 
no markdown, no code blocks. Just raw JSON with exactly 
these fields:

{
  document_type: string (be specific, e.g. 'Car Insurance 
    Policy Summary', 'HMRC Self Assessment Letter', 
    'Tenancy Agreement', 'Parking Charge Notice'),
    
  summary: string (write 5-7 sentences that cover:
    - What this document actually is in one sentence
    - Who sent it and why
    - What it means for the person personally
    - Any important numbers, dates or amounts mentioned
    - Whether there is anything to worry about or not
    - Make it feel like a friend explaining it over coffee),
    
  actions: array of 3-5 strings (make these very specific 
    and practical, not generic. Bad example: 'Read the 
    document carefully'. Good example: 'Check the renewal 
    date on page 1 - if it is coming up in the next 30 days 
    you need to decide whether to renew or switch providers'.
    Each action should start with a verb and be under 25 words),
    
  urgency: one of exactly these three values: 
    urgent, soon, no-action-needed
    (urgent = needs action within 7 days,
    soon = needs action within 30 days,
    no-action-needed = informational only),
    
  deadline: string or null (any specific date or deadline 
    mentioned, written as a plain English date like 
    '15 April 2026', or null if none),
    
  key_numbers: array of strings or empty array (list any 
    important amounts, dates, reference numbers or figures 
    from the document, e.g. 
    ['Policy number: ABC123', 'Annual premium: £450', 
    'Renewal date: 15 June 2026'])
}`;

type SupportedMediaType =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/webp";

function getMediaTypeFromFilename(filename: string): SupportedMediaType | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return null;
}

function getTextFromClaudeResponse(result: Anthropic.Messages.Message): string {
  for (const block of result.content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { message: "Could not analyse document" },
        { status: 500, headers: { "cache-control": "no-store" } }
      );
    }

    const formData = await request.formData();
    const pastedText = formData.get("text");
    const file = formData.get("file") as File;

    if (typeof pastedText === "string" && pastedText.trim().length > 0) {
      const client = new Anthropic({ apiKey });

      const result = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please explain the following document text:\n\n${pastedText}`
              }
            ]
          }
        ]
      });

      const responseText = getTextFromClaudeResponse(result).trim();
      console.log("Raw Claude response text:", responseText);
      const parsed = JSON.parse(responseText) as unknown;

      return Response.json(parsed, { headers: { "cache-control": "no-store" } });
    }

    if (!file || typeof file.arrayBuffer !== "function") {
      return Response.json(
        { message: "Unsupported file type" },
        { status: 400, headers: { "cache-control": "no-store" } }
      );
    }

    console.log(`File received: ${file.name} ${file.type} ${file.size} bytes`);
    console.log("API route hit - file received:", { name: file.name, size: file.size });

    const mediaType = getMediaTypeFromFilename(file.name);
    if (!mediaType) {
      return Response.json(
        { message: "Unsupported file type" },
        { status: 400, headers: { "cache-control": "no-store" } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    const client = new Anthropic({ apiKey });

    console.log("Sending to Claude...", { mediaType, base64Length: base64.length });

    const result = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        mediaType === "application/pdf"
          ? {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64
                  }
                },
                {
                  type: "text",
                  text: "Please explain this document in plain English as instructed."
                }
              ]
            }
          : {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64
                  }
                },
                {
                  type: "text",
                  text: "Please explain this document in plain English as instructed."
                }
              ]
            }
      ]
    });

    const text = getTextFromClaudeResponse(result).trim();
    console.log("Raw Claude response text:", text);
    const parsed = JSON.parse(text) as unknown;

    return Response.json(parsed, { headers: { "cache-control": "no-store" } });
} catch (error: unknown) {
  console.log("FULL ERROR:", JSON.stringify(error, null, 2))
  if (error instanceof Error) {
    console.log("ERROR MESSAGE:", error.message)
  }
  return NextResponse.json(
    { error: "Could not analyse document" },
    { status: 500 }
  )
}
}

