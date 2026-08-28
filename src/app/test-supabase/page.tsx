"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabasePage() {
  const [status, setStatus] = useState("Checking connection...");

  useEffect(() => {
    const testConnection = async () => {
      const { error } = await supabase
        .from("test_connection")
        .select("*")
        .limit(1);

      if (error) {
        setStatus(`Connection reached Supabase: ${error.message}`);
      } else {
        setStatus("Supabase connected successfully!");
      }
    };

    testConnection();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Supabase Connection Test
        </h1>

        <p className="mt-4 text-lg">
          {status}
        </p>
      </div>
    </main>
  );
}