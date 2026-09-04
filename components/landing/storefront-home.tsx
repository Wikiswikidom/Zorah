import { EditorialMotion } from "./editorial-motion";
import { ActiveCampaigns } from "@/components/active-campaigns";
import { createAdminClient } from "@/lib/supabase/admin";

type Section = {
  id: string; section_key: string; section_type: string; eyebrow: string | null; title: string | null; body: string | null;
  primary_cta_label: string | null; primary_cta_href: string | null; secondary_cta_label: string | null; secondary_cta_href: string | null;
  media_path: string | null; theme: string; is_enabled: boolean; sort_order: number; status: string; scheduled_publish_at: string | null;
};
type Campaign = { id:string; title:string; message:string|null; cta_label:string|null; cta_href:string|null; campaign_type:string; media_path:string|null; ends_at:string|null; show_countdown:boolean; discount_type:string|null; discount_value:number|null };

export default async function StorefrontHome(){
  const supabase=createAdminClient();
  const now=new Date();
  const [{data:rawSections},{data:rawCampaigns}]=await Promise.all([
    supabase.from("landing_sections").select("id,section_key,section_type,eyebrow,title,body,primary_cta_label,primary_cta_href,secondary_cta_label,secondary_cta_href,media_path,theme,is_enabled,sort_order,status,scheduled_publish_at").eq("status","published").eq("is_enabled",true).order("sort_order",{ascending:true}).order("created_at",{ascending:true}),
    supabase.from("campaigns").select("id,title,message,cta_label,cta_href,campaign_type,media_path,ends_at,show_countdown,discount_type,discount_value,starts_at").eq("status","live").in("placement",["landing","both"]).order("priority",{ascending:false}).limit(10),
  ]);
  const sections=((rawSections??[]) as Section[]).filter(s=>!s.scheduled_publish_at||new Date(s.scheduled_publish_at).getTime()<=now.getTime());
  const mediaEntries=await Promise.all(sections.filter(s=>s.media_path).map(async s=>{const{data}=await supabase.storage.from("product-media").createSignedUrl(s.media_path!,3600);return[s.section_key,data?.signedUrl??""] as const;}));
  const media=Object.fromEntries(mediaEntries.filter(([,url])=>Boolean(url)));
  const logo=media["site-logo"]||"/brand/zorah-logo.webp";
  const activeCampaigns:Campaign[]=await Promise.all(((rawCampaigns??[]) as Array<Campaign&{starts_at:string|null}>).filter(c=>{const starts=c.starts_at?new Date(c.starts_at).getTime():-Infinity;const ends=c.ends_at?new Date(c.ends_at).getTime():Infinity;return starts<=now.getTime()&&ends>now.getTime();}).map(async c=>{if(!c.media_path)return c;const{data}=await supabase.storage.from("product-media").createSignedUrl(c.media_path,900);return{...c,media_path:data?.signedUrl??null};}));
  return <><ActiveCampaigns campaigns={activeCampaigns}/><EditorialMotion sections={sections.map(s=>({...s,media_url:s.media_path?media[s.section_key]??null:null}))} logoUrl={logo}/></>;
}
