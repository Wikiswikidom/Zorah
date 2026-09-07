import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  // The public root is the brand/landing experience. Once a customer is
  // authenticated, the root becomes the commerce home (the product shop).
  if (claimsData?.claims) redirect("/shop");
  redirect("/landing");
}
