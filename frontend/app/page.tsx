"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(localStorage.getItem("token") ? "/dashboard" : "/login");
  }, [router]);
  return <main className="flex min-h-screen items-center justify-center bg-slate-50"><p className="text-sm font-semibold text-slate-500">Loading TripNest…</p></main>;
}
