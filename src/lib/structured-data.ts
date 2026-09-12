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

/** One LocalBusiness entry per showroom — schema.org has no clean way to give
 * a single business multiple addresses. */
export function localBusinessSchema() {
  return SITE.locations.map((loc) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${SITE.name} — ${loc.name}`,
    url: SITE.url,
    telephone: SITE.phoneHref,
    email: SITE.email,
    areaServed: SITE.serviceArea,
    sameAs: SITE.social.map((s) => s.href),
    address: postalAddress(loc.address),
  }));
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
    ...(product.imageUrl ? { image: new URL(product.imageUrl, SITE.url).toString() } : {}),
    url: `${SITE.url}/product/${product.slug}`,
    brand: { "@type": "Brand", name: SITE.name },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  };
}
