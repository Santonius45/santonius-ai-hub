import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("api_requests")
      .select(
        "id, provider_name, model, prompt, response, status_code, latency_ms, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch API statistics:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch API statistics.",
        },
        { status: 500 }
      );
    }

    const requests = data ?? [];

    const totalRequests = requests.length;

    const successfulRequests = requests.filter(
      (item) =>
        item.status_code !== null &&
        item.status_code >= 200 &&
        item.status_code < 300
    ).length;

    const failedRequests = totalRequests - successfulRequests;

    const latencyValues = requests
      .map((item) => item.latency_ms)
      .filter(
        (latency): latency is number =>
          typeof latency === "number"
      );

    const averageResponseTime =
      latencyValues.length > 0
        ? Math.round(
            latencyValues.reduce(
              (sum, latency) => sum + latency,
              0
            ) / latencyValues.length
          )
        : 0;

    const successRate =
      totalRequests > 0
        ? Math.round(
            (successfulRequests / totalRequests) * 100
          )
        : 0;

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(
      startOfWeek.getDate() - diff
    );

    startOfWeek.setHours(0, 0, 0, 0);

    const requestsToday = requests.filter(
      (item) =>
        new Date(item.created_at) >= startOfToday
    ).length;

    const requestsThisWeek = requests.filter(
      (item) =>
        new Date(item.created_at) >= startOfWeek
    ).length;

    /*
     * Provider usage
     */
    const providerMap: Record<string, number> = {};

    requests.forEach((item) => {
      const provider = item.provider_name || "Unknown";

      providerMap[provider] =
        (providerMap[provider] || 0) + 1;
    });

    const providerUsage = Object.entries(providerMap)
      .map(([provider, count]) => ({
        provider,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    /*
     * Daily request analytics
     * Last 7 days
     */
    const dailyRequests = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);

      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRequests = requests.filter((item) => {
        const created = new Date(item.created_at);

        return (
          created >= date &&
          created < nextDate
        );
      });

      dailyRequests.push({
        date: date.toISOString(),
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        count: dayRequests.length,
        successful: dayRequests.filter(
          (item) =>
            item.status_code !== null &&
            item.status_code >= 200 &&
            item.status_code < 300
        ).length,
        failed: dayRequests.filter(
          (item) =>
            item.status_code === null ||
            item.status_code < 200 ||
            item.status_code >= 300
        ).length,
      });
    }

    /*
     * Average latency
     */
    const successfulLatencies = requests
      .filter(
        (item) =>
          item.status_code !== null &&
          item.status_code >= 200 &&
          item.status_code < 300 &&
          typeof item.latency_ms === "number"
      )
      .map((item) => item.latency_ms as number);

    const averageSuccessfulLatency =
      successfulLatencies.length > 0
        ? Math.round(
            successfulLatencies.reduce(
              (sum, latency) => sum + latency,
              0
            ) / successfulLatencies.length
          )
        : 0;

    return NextResponse.json({
      success: true,

      stats: {
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime,
        averageSuccessfulLatency,
        successRate,
        requestsToday,
        requestsThisWeek,
      },

      providerUsage,

      dailyRequests,

      recentRequests: requests.slice(0, 5),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load dashboard statistics.",
      },
      { status: 500 }
    );
  }
}