import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";

function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies();
          return cookieStore.getAll();
        },

        async setAll(cookiesToSet) {
          const cookieStore = await cookies();

          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore cookie errors when called from a Server Component.
          }
        },
      },
    }
  );
}

function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

function generateApiKey() {
  const randomPart = crypto.randomBytes(32).toString("base64url");

  return `sk-santonius-${randomPart}`;
}

// GET /api/keys
// Mengambil API keys milik user yang sedang login.
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { data, error } = await supabase
      .from("api_keys")
      .select(
        "id, name, key_prefix, created_at, last_used_at, revoked_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch API keys:", error);

      return NextResponse.json(
        {
          error: "Failed to fetch API keys",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      keys: data ?? [],
    });
  } catch (error) {
    console.error("API keys GET error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

// POST /api/keys
// Membuat API key baru.
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    let body: { name?: string } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim().slice(0, 100)
        : "My API Key";

    const apiKey = generateApiKey();

    const keyPrefix = apiKey.slice(0, 22);

    const keyHash = hashApiKey(apiKey);

    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
      })
      .select(
        "id, name, key_prefix, created_at, last_used_at, revoked_at"
      )
      .single();

    if (error) {
      console.error("Failed to create API key:", error);

      return NextResponse.json(
        {
          error: "Failed to create API key",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        key: apiKey,
        apiKey: data,
        warning:
          "Copy this API key now. For security, the full key will not be shown again.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("API keys POST error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}