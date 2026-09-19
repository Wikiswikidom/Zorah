import type { Metadata } from "next";
import "./tailwind.css";
import "./globals.css";
import "./commerce.css";
import "./landing.css";
import "./landing-responsive.css";
import "./login.css";
import "./orders.css";
import "./storefront-commerce.css";
import "./admin-ui.css";
import "./product-page.css";
import "./checkout/checkout.css";
import "./storefront-final.css";
import "./storefront-header.css";
import "./account.css";
import "./auth-landing.css";
import "./responsive-ux.css";
import { Cormorant_Garamond, Open_Sans } from "next/font/google";
import { CommerceProvider } from "@/components/commerce-provider";
import CampaignNavigationLoader from "@/components/campaign-navigation-loader";
import { absoluteUrl, defaultDescription, defaultKeywords, defaultTitle, siteName } from "@/lib/seo";

const display=Cormorant_Garamond({subsets:["latin"],variable:"--font-display",display:"swap"});
const sans=Open_Sans({subsets:["latin"],variable:"--font-sans",display:"swap"});
export const metadata:Metadata={
 metadataBase:new URL(absoluteUrl('/')),
 title:{default:defaultTitle,template:`%s | ${siteName}`},
 description:defaultDescription,keywords:defaultKeywords,applicationName:siteName,authors:[{name:siteName}],creator:siteName,publisher:siteName,
 alternates:{canonical:"/landing"},
 robots:{index:true,follow:true,maxSnippet:-1,maxImagePreview:"large",maxVideoPreview:-1},
 openGraph:{type:"website",locale:"en_NG",siteName,title:defaultTitle,description:defaultDescription,url:"/landing",images:[{url:"/opengraph-image",width:1200,height:630,alt:defaultTitle}]},
 twitter:{card:"summary_large_image",title:defaultTitle,description:defaultDescription,images:["/opengraph-image"]},
 icons:{icon:"/icon"},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${display.variable} ${sans.variable}`}><CommerceProvider><CampaignNavigationLoader/>{children}</CommerceProvider></body></html>}
