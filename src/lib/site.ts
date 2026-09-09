export const SITE = {
  name: "Windy City Linen",
  tagline: "Event linen rentals for Chicago & Milwaukee",
  phone: "(224) 279-1500",
  phoneHref: "+12242791500",
  email: "info@windycitylinen.com",
  serviceArea: "Chicagoland and Milwaukee",
  since: 2008,
  showrooms: ["Wheeling, IL", "Elm Grove, WI"],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
