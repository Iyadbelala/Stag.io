"use client";

import { useAuth } from "@/Components/contexts/AuthContext";
import Homepage from "@/screen/Homepage/page";
import InternshipsPage from "@/screen/Internships/page";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return user ? <InternshipsPage /> : <Homepage />;
}
