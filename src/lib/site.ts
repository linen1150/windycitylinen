export const SITE = {
  name: "Windy City Linen",
  tagline: "Event linen rentals for Chicago & Milwaukee",
  phone: "(224) 279-1500",
  phoneHref: "+12242791500",
  email: "info@windycitylinen.com",
  ordersEmail: "orders@windycitylinen.com",
  serviceArea: "Chicagoland and Milwaukee",
  since: 2008,
  showrooms: ["Wheeling, IL", "Elm Grove, WI"],
  social: [
    { name: "Instagram", href: "https://www.instagram.com/windycitylinen" },
    { name: "Facebook", href: "https://www.facebook.com/WindyCityLinen" },
  ] as { name: "Instagram" | "Facebook" | "Pinterest" | "LinkedIn" | "YouTube"; href: string }[],
  locations: [
    {
      name: "Chicago Location",
      note: "Showroom by appointment only",
      address: "1150 Willis Avenue, Wheeling, IL 60090",
      mapQuery: "Windy City Linen, 1150 Willis Avenue, Wheeling, IL 60090",
    },
    {
      name: "Wisconsin Location",
      note: "Showroom by appointment only",
      address: "890 Elm Grove Rd, Building 1 Suite 105, Elm Grove, WI 53122",
      mapQuery: "890 Elm Grove Rd, Elm Grove, WI 53122",
    },
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
