import { AppPreview } from "@/components/site/AppPreview";
import { Download } from "@/components/site/Download";
import { Faq } from "@/components/site/Faq";
import { Features } from "@/components/site/Features";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Mission } from "@/components/site/Mission";
import { Nav } from "@/components/site/Nav";
import { Trust } from "@/components/site/Trust";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-background"
      >
        Skip to main content
      </a>

      <Nav />

      <main id="main" tabIndex={-1}>
        <Hero />
        <Mission />
        <Features />
        <HowItWorks />
        <AppPreview />
        <Download />
        <Trust />
        <Faq />
      </main>

      <Footer />
    </div>
  );
}
