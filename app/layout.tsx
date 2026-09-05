import type { Metadata } from "next";
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
import { Cormorant_Garamond, Open_Sans } from "next/font/google";
import { CommerceProvider } from "@/components/commerce-provider";

const display=Cormorant_Garamond({subsets:["latin"],variable:"--font-display",display:"swap"});
const sans=Open_Sans({subsets:["latin"],variable:"--font-sans",display:"swap"});
export const metadata:Metadata={title:"Zorah Handbags — Crafted to be carried.",description:"Contemporary leather handbags crafted in Lagos with a modern African point of view."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${display.variable} ${sans.variable}`}><CommerceProvider>{children}</CommerceProvider></body></html>}
