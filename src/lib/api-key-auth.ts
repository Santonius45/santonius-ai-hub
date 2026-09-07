import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function authenticateApiKey(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return {
      authenticated: false,
      userId: null,
      apiKeyId: null,
      error: "API key is required.",
    };
  }

  if (!authorization.startsWith("Bearer ")) {
    return {
      authenticated: false,
      userId: null,
      apiKeyId: null,
      error: "Invalid authorization format.",
    };
  }

  const apiKey = authorization.substring(7).trim();

  if (!apiKey) {
    return {
      authenticated: false,
      userId: null,
      apiKeyId: null,
      error: "API key is required.",
    };
  }

  const keyHash = crypto
    .createHash("sha256")
    .update(apiKey)
    .digest("hex");

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, user_id, revoked_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error) {
    console.error("API key authentication error:", error);

    return {
      authenticated: false,
      userId: null,
      apiKeyId: null,
      error: "Failed to authenticate API key.",
    };
  }

  if (!data) {
    return {
      authenticated: false,
      userId: null,
      apiKeyId: null,
      error: "Invalid API key.",
    };
  }

  if (data.revoked_at) {
    return {
      authenticated: false,
      userId: null,
      apiKeyId: null,
      error: "API key has been revoked.",
    };
  }

  await supabaseAdmin
    .from("api_keys")
    .update({
      last_used_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  return {
    authenticated: true,
    userId: data.user_id,
    apiKeyId: data.id,
    error: null,
  };
}