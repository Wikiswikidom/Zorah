export type CampaignType = "announcement" | "hero" | "editorial" | "flash-sale" | "product-rail" | "news";

export type Campaign = {
  id: string;
  name: string;
  type: CampaignType;
  headline: string;
  description?: string;
  ctaLabel?: string;
  destination?: string;
  desktopImage?: string;
  mobileImage?: string;
  startAt?: string;
  endAt?: string;
  priority: number;
  status: "draft" | "published" | "scheduled" | "expired";
};

/**
 * Phase 2A content contract.
 *
 * The UI reads a stable content shape now so the presentation layer does not
 * need to change when campaigns and landing sections move into Supabase.
 */
export type LandingSection =
  | { type: "hero"; campaignId?: string }
  | { type: "campaign"; campaignId: string }
  | { type: "product-rail"; title: string; collectionSlug: string }
  | { type: "craft"; title: string; body: string; image?: string }
  | { type: "editorial"; title: string; body: string; image?: string; href?: string }
  | { type: "custom"; title: string; body: string; href: string }
  | { type: "journal"; title: string };

export const defaultLandingSections: LandingSection[] = [
  { type: "hero" },
  { type: "product-rail", title: "The signature edit", collectionSlug: "signature" },
  { type: "craft", title: "Made with patience.", body: "Considered proportions, tactile leather and details that reward a closer look." },
  { type: "custom", title: "Create your Zorah.", body: "Request a custom silhouette, leather, colour, hardware or finishing detail.", href: "/custom" },
  { type: "journal", title: "From the house" },
];
