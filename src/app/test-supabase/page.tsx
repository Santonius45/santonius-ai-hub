"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function TestSupabasePage() {
const [status, setStatus] = useState("Checking connection...");

useEffect(() => {
const testConnection = async () => {
const supabase = createSupabaseBrowserClient();


  const { error } = await supabase
    .from("api_requests")
    .select("*")
    .limit(1);

  if (error) {
    setStatus(
      "Supabase connection error: " + error.message
    );
  } else {
    setStatus("Supabase connected successfully!");
  }
};

testConnection();


}, []);

return ( <main className="min-h-screen bg-black text-white flex items-center justify-center px-6"> <div className="text-center"> <h1 className="text-3xl font-bold">
Supabase Connection Test </h1>


    <p className="mt-4 text-lg text-gray-300">
      {status}
    </p>
  </div>
</main>


);
}
