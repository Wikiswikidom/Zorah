import { EditorialMotion } from "./editorial-motion";
import { ActiveCampaigns } from "@/components/active-campaigns";
import { createClient } from "@/lib/supabase/server";

type Section = {
  id: string;
  section_key: string;
  section_type: string;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  primary_cta_label: string | null;
  primary_cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  media_path: string | null;
  theme: string;
  is_enabled: boolean;
  sort_order: number;
  status: string;
  scheduled_publish_at: string | null;
};

type Campaign = {
  id: string;
  title: string;
  message: string | null;
  cta_label: string | null;
  cta_href: string | null;
  campaign_type: string;
  media_path: string | null;
  ends_at: string | null;
  show_countdown: boolean;
  discount_type: string | null;
  discount_value: number | null;
};

export default async function StorefrontHome() {
  const supabase = await createClient();
  const now = new Date();
  const [{ data: rawSections }, { data: rawCampaigns }] = await Promise.all([
    supabase
      .from("landing_sections")
      .select("id,section_key,section_type,eyebrow,title,body,primary_cta_label,primary_cta_href,secondary_cta_label,secondary_cta_href,media_path,theme,is_enabled,sort_order,status,scheduled_publish_at")
      .eq("status", "published")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("campaigns")
      .select("id,title,message,cta_label,cta_href,campaign_type,media_path,ends_at,show_countdown,discount_type,discount_value,starts_at")
      .eq("status", "live")
      .in("placement", ["landing", "both"])
      .order("priority", { ascending: false })
      .limit(10),
  ]);

  const sections = ((rawSections ?? []) as Section[]).filter((section) => {
    if (!section.scheduled_publish_at) return true;
    return new Date(section.scheduled_publish_at).getTime() <= now.getTime();
  });

  const mediaEntries = await Promise.all(
    sections
      .filter((section) => section.media_path)
      .map(async (section) => {
        const { data } = await supabase.storage.from("product-media").createSignedUrl(section.media_path!, 3600);
        return [section.section_key, data?.signedUrl ?? ""] as const;
      }),
  );
  const media = Object.fromEntries(mediaEntries.filter(([, url]) => Boolean(url)));
  const logo = media["site-logo"] ?? "/brand/zorah-logo.webp";

  const activeCampaigns: Campaign[] = await Promise.all(
    ((rawCampaigns ?? []) as Array<Campaign & { starts_at: string | null }>).filter((campaign) => {
      const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : -Infinity;
      const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : Infinity;
      return starts <= now.getTime() && ends > now.getTime();
    }).map(async (campaign) => {
      if (!campaign.media_path) return campaign;
      const { data } = await supabase.storage.from("product-media").createSignedUrl(campaign.media_path, 900);
      return { ...campaign, media_path: data?.signedUrl ?? null };
    }),
  );

  return (
    <>
      <ActiveCampaigns campaigns={activeCampaigns} />
      <EditorialMotion sections={sections} logoUrl={logo} />
    </>
  );
}
