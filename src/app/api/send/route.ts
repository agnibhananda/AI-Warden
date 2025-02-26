"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_TOKEN!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, turnstileToken } = body;

    // Verify Turnstile token
    const tokenVerified = await verifyTurnstileToken(turnstileToken);
    if (!tokenVerified) {
      return new Response(JSON.stringify({ error: "Invalid CAPTCHA" }), {
        status: 400,
      });
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate response
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ response: text }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500 }
    );
  }
}