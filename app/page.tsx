import { EditorialMotion } from "@/components/landing/editorial-motion";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const media: Record<string,string> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("landing_sections").select("section_key,media_path").eq("status","published").eq("is_enabled",true).not("media_path","is",null);
    await Promise.all((data ?? []).map(async section => {
      if (!section.media_path) return;
      const { data: signed } = await supabase.storage.from("product-media").createSignedUrl(section.media_path, 3600);
      if (signed?.signedUrl) media[section.section_key] = signed.signedUrl;
    }));
  } catch {}
  return <main className="landing-page" id="top"><EditorialMotion media={media} /></main>;
}
