import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const geminiApiKey = process.env.GEMINI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY is not configured.");
}

const gemini = new GoogleGenAI({
  apiKey: geminiApiKey,
});

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

const GEMINI_MODEL = "gemini-2.5-flash";
const OPENAI_MODEL = "gpt-4o-mini";

export async function POST(request: Request) {
  const startTime = Date.now();

  let prompt = "";
  let provider = "";
  let model = "";

  let authenticatedUserId: string | null = null;
  let authenticatedApiKeyId: string | null = null;

  try {
    const body = await request.json();

    prompt = body?.prompt;
    provider = body?.provider || "gemini";

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required.",
        },
        { status: 400 }
      );
    }

    if (!["gemini", "openai"].includes(provider)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported AI provider.",
        },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization");

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    if (authorization) {
      const apiKeyAuth = await authenticateApiKey(request);

      if (!apiKeyAuth.authenticated || !apiKeyAuth.userId) {
        return NextResponse.json(
          {
            success: false,
            error: apiKeyAuth.error || "Invalid API key.",
          },
          { status: 401 }
        );
      }

      authenticatedUserId = apiKeyAuth.userId;
      authenticatedApiKeyId = apiKeyAuth.apiKeyId;
    } else {
      const supabase = await createSupabaseServerClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json(
          {
            success: false,
            error: "You must be logged in or provide a valid API key.",
          },
          { status: 401 }
        );
      }

      authenticatedUserId = user.id;
      authenticatedApiKeyId = null;
    }

    let aiResponse = "";
    let providerName = "";

    // ==========================================
    // GOOGLE GEMINI
    // ==========================================

    if (provider === "gemini") {
      model = GEMINI_MODEL;
      providerName = "Google Gemini";

      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      aiResponse = response.text ?? "";
    }

    // ==========================================
    // OPENAI
    // ==========================================

    if (provider === "openai") {
      model = OPENAI_MODEL;
      providerName = "OpenAI";

      const response = await openai.responses.create({
        model: OPENAI_MODEL,
        input: prompt,
      });

      aiResponse = response.output_text ?? "";
    }

    const latencyMs = Date.now() - startTime;

    // ==========================================
    // SAVE SUCCESSFUL REQUEST
    // ==========================================

    const { error: insertError } = await supabaseAdmin
      .from("api_requests")
      .insert({
        user_id: authenticatedUserId,
        api_key_id: authenticatedApiKeyId,
        provider_name: providerName,
        model: model,
        prompt: prompt,
        response: aiResponse,
        status_code: 200,
        latency_ms: latencyMs,
        error_message: null,
      });

    if (insertError) {
      console.error("Failed to save API request:", insertError);
    }

    return NextResponse.json({
      success: true,
      provider: providerName,
      model: model,
      response: aiResponse,
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    console.error("AI API error:", error);

    // ==========================================
    // LOG FAILED REQUEST
    // ==========================================

    try {
      if (prompt && authenticatedUserId) {
        await supabaseAdmin.from("api_requests").insert({
          user_id: authenticatedUserId,
          api_key_id: authenticatedApiKeyId,
          provider_name:
            provider === "openai"
              ? "OpenAI"
              : "Google Gemini",
          model:
            model ||
            (provider === "openai"
              ? OPENAI_MODEL
              : GEMINI_MODEL),
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
    } catch (loggingError) {
      console.error(
        "Failed to log API error:",
        loggingError
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate AI response.",
      },
      { status: 500 }
    );
  }
}