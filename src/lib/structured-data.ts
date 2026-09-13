import { SITE } from "@/lib/site";

const ADDRESS_RE = /^(.*),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})$/;

function postalAddress(address: string) {
  const m = address.match(ADDRESS_RE);
  if (!m) return { "@type": "PostalAddress", streetAddress: address, addressCountry: "US" };
  const [, streetAddress, addressLocality, addressRegion, postalCode] = m;
  return {
    "@type": "PostalAddress",
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry: "US",
  };
}

export function locationAnchor(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** One LocalBusiness entry per showroom, each with its own @id/url anchored
 * to its section on /contact — schema.org has no clean way to give a single
 * business multiple addresses, and a shared @id/url would keep the two
 * showrooms from ranking independently in Google's local pack. */
export function localBusinessSchema() {
  return SITE.locations.map((loc) => {
    const anchor = `${SITE.url}/contact#${locationAnchor(loc.name)}`;
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": anchor,
      name: `${SITE.name} — ${loc.name}`,
      url: anchor,
      telephone: SITE.phoneHref,
      email: SITE.ordersEmail,
      areaServed: SITE.serviceArea,
      sameAs: SITE.social.map((s) => s.href),
      address: postalAddress(loc.address),
    };
  });
}

/** Sitewide brand identity — belongs on the homepage only, one per site. */
export function organizationSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE.url}#organization`,
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/apple-icon.png`,
      sameAs: SITE.social.map((s) => s.href),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE.url}#website`,
      name: SITE.name,
      url: SITE.url,
      publisher: { "@id": `${SITE.url}#organization` },
    },
  ];
}

export function productSchema(product: {
  name: string;
  slug: string;
  fabric: string;
  colorName: string;
  imageUrl: string | null;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: `${product.colorName} in our ${product.fabric} fabric, available to rent from Windy City Linen.`,
    category: product.category,
    color: product.colorName,
    material: product.fabric,
    sku: product.slug,
    ...(product.imageUrl ? { image: new URL(product.imageUrl, SITE.url).toString() } : {}),
    url: `${SITE.url}/product/${product.slug}`,
    brand: { "@type": "Brand", name: SITE.name },
    // No `offers` — this is a quote-request business with no published
    // pricing (a hard client requirement), so the product rich-result
    // eligibility that `offers` unlocks is knowingly skipped rather than
    // publishing a fake price to qualify for it.
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  const withHome = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: withHome.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  };
}
