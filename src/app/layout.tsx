import type { Metadata } from "next";
import { Fraunces, Work_Sans, Great_Vibes } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { QuoteProvider } from "@/components/quote/quote-store";
import { QuoteTray } from "@/components/quote/quote-tray";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Event Linen Rentals in Chicago & Milwaukee | Windy City Linen",
    template: "%s | Windy City Linen",
  },
  description:
    "Tablecloths, napkins, table runners and chair covers for weddings, galas and corporate events across Chicago and Milwaukee. Browse the collection and request a quote.",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${workSans.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <QuoteProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <QuoteTray />
        </QuoteProvider>
      </body>
    </html>
  );
}
