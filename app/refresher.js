"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-fetches the server component every `seconds` so the dashboard stays live
// without a full page reload.
export default function Refresher({ seconds = 15 }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
