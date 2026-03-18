// API route: accepts an uploaded document, asks Claude for a plain-English JSON explanation, returns parsed JSON.

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import * as pdfParse from "pdf-parse";

export const maxDuration = 60;
export const runtime = "nodejs";

const FREE_PAGE_LIMIT = 10;
const PRO_PAGE_LIMIT = 30;
const HARD_PAGE_LIMIT = 30;

const SYSTEM_PROMPT = `You are a knowledgeable friend helping someone 
understand a document they have received or are about to sign. 
Your job is to:

1. Explain what the document actually means in plain English
2. Flag anything unusual, risky, or important they need to be aware of
3. Explain any legal or technical terms in simple language
4. Tell them anything they might not realise but should know

Write as if explaining to a smart friend who has never seen this type of document before. 
Use simple words. If you use a technical term, immediately explain it in brackets.

Be thorough but readable. Don't just summarise — actually explain what the terms MEAN for the person reading it.

Return your response as valid JSON only, with no extra text, no markdown, no code blocks. 
Just raw JSON with exactly these fields:

{
  document_type: string (be specific, e.g. 'Assured Shorthold Tenancy Agreement',
    'HMRC Self Assessment Letter'),

  summary: string (write 6-8 sentences that:
    - Say what this document is in one sentence
    - Explain the most important terms and what they actually mean for this person
    - Flag anything unusual, risky, or that they might not realise
    - Mention any important numbers, dates or amounts
    - End with whether there is anything to worry about overall),

  important_flags: array of strings or empty array
    (list anything the person MUST know or watch out for — unusual clauses, tight deadlines,
    risks, things that could cost them money or affect their rights. Each flag under 30 words.
    If nothing unusual, return empty array),

  actions: array of 3-5 strings (very specific and practical next steps, not generic advice.
    Each action should start with a verb, under 25 words),

  urgency: one of exactly: urgent, soon, no-action-needed,

  deadline: string or null (any specific date or deadline mentioned, or null if none),

  key_numbers: array of strings or empty array (all important amounts, dates, reference numbers from the document)
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

    if (mediaType === "application/pdf") {
      try {
        const pdfData = await (pdfParse as any)(buffer);
        const pageCount = pdfData?.numpages;
        console.log("PDF page count:", pageCount);

        if (
          typeof pageCount === "number" &&
          pageCount > HARD_PAGE_LIMIT
        ) {
          return Response.json(
            {
              error: "Document too long",
              message: `This document has ${pageCount} pages. Please upload a document with 30 pages or fewer.`,
              pageCount
            },
            { status: 400, headers: { "cache-control": "no-store" } }
          );
        }
      } catch {
        // Fail open: if pdf-parse fails, continue processing normally.
      }
    }

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

