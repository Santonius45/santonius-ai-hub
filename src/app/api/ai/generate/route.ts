import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
  apiKey,
});

const MODEL = "gemini-2.5-flash";
const PROVIDER_NAME = "Google Gemini";

export async function POST(request: Request) {
  const startTime = Date.now();

  let prompt = "";

  try {
    const body = await request.json();

    prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required.",
        },
        { status: 400 }
      );
    }

    // Get Supabase server client
    const supabase = await createSupabaseServerClient();

    // Get currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to use the API Hub.",
        },
        { status: 401 }
      );
    }

    // Call Gemini
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const aiResponse = response.text ?? "";
    const latencyMs = Date.now() - startTime;

    // Save API request to Supabase
    const { error: insertError } = await supabase
      .from("api_requests")
      .insert({
        user_id: user.id,
        provider_name: PROVIDER_NAME,
        model: MODEL,
        prompt: prompt,
        response: aiResponse,
        status_code: 200,
        latency_ms: latencyMs,
        error_message: null,
      });

    if (insertError) {
      console.error("Failed to save API request:", insertError);
    }

    // Keep the existing API response format
    return NextResponse.json({
      success: true,
      provider: PROVIDER_NAME,
      model: MODEL,
      response: aiResponse,
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    console.error("Gemini API error:", error);

    // Try to log failed request if user is available
    try {
      if (prompt) {
        const supabase = await createSupabaseServerClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase.from("api_requests").insert({
            user_id: user.id,
            provider_name: PROVIDER_NAME,
            model: MODEL,
            prompt: prompt,
            response: null,
            status_code: 500,
            latency_ms: latencyMs,
            error_message:
              error instanceof Error
                ? error.message
                : "Failed to generate AI response.",
          });
        }
      }
    } catch (loggingError) {
      console.error("Failed to log API error:", loggingError);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI response.",
      },
      { status: 500 }
    );
  }
}