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

const display=Cormorant_Garamond({subsets:["latin"],variable:"--font-display",display:"swap"});
const sans=Open_Sans({subsets:["latin"],variable:"--font-sans",display:"swap"});
export const metadata:Metadata={title:"Zorah Handbags — Crafted to be carried.",description:"Contemporary leather handbags crafted in Lagos, Nigeria, with a modern African point of view.",metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL||'zorah-eight.vercel.app'}`),alternates:{canonical:'/landing'},openGraph:{siteName:'Zorah Handbags',type:'website',title:'Zorah Handbags — Crafted to be carried.',description:'Contemporary leather handbags crafted in Lagos, Nigeria, with a modern African point of view.'},twitter:{card:'summary_large_image',title:'Zorah Handbags — Crafted to be carried.',description:'Contemporary leather handbags crafted in Lagos, Nigeria, with a modern African point of view.'},verification:process.env.GOOGLE_SITE_VERIFICATION?{google:process.env.GOOGLE_SITE_VERIFICATION}:undefined,icons:{icon:'/icon'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${display.variable} ${sans.variable}`}><a href="#main-content" className="skip-link">Skip to content</a><CommerceProvider><CampaignNavigationLoader/><div id="main-content">{children}</div></CommerceProvider></body></html>}
