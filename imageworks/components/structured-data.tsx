import { FAQS } from "@/lib/faqs";
import { siteConfig } from "@/lib/metadata";
import type { ReactNode } from "react";

export function StructuredData(): ReactNode {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/icon.svg`,
      sameAs: ["https://x.com/imageworks", "https://instagram.com/imageworks"],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      description: siteConfig.description,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "12",
        highPrice: "124",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"

      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
