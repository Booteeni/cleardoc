# Project: ClearDoc

A web app where users upload a confusing document and get a 
plain-English explanation back.

## What it does
1. User uploads a PDF or photo of a document
2. App sends it to Claude AI
3. User gets back: what the document is, what it means, 
   and what to do next

## Who it's for
People aged 25-35 who receive confusing letters from HMRC, 
landlords, insurance companies, doctors, or councils and 
feel anxious about them.

## Tone
Calm, reassuring, friendly. Like a helpful friend — not a 
legal tool.

## Tech stack
- Next.js 16 with app router
- Tailwind CSS for styling
- Supabase for auth and database
- Claude API (claude-sonnet-4-20250514 model) for AI
- Stripe for payments (added later)
- Deployed on Vercel