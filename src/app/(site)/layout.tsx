import { InspirationsProvider } from "@/components/inspirations/inspirations-store";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ChatWidget } from "@/components/site/chat-widget";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <InspirationsProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <ChatWidget />
    </InspirationsProvider>
  );
}
