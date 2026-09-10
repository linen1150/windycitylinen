export const SITE = {
  name: "Windy City Linen",
  tagline: "Event linen rentals for Chicago & Milwaukee",
  phone: "(224) 279-1500",
  phoneHref: "+12242791500",
  phoneExt: "7",
  email: "info@windycitylinen.com",
  ordersEmail: "orders@windycitylinen.com",
  serviceArea: "Chicagoland and Milwaukee",
  since: 2008,
  showrooms: ["Wheeling, IL", "Elm Grove, WI"],
  locations: [
    {
      name: "Chicago Location",
      address: "1150 Willis Avenue, Wheeling, IL 60090",
      mapQuery: "Windy City Linen, 1150 Willis Avenue, Wheeling, IL 60090",
      hours: ["Monday – Friday: 8:30am–5pm CST", "Showroom hours by appointment only"],
    },
    {
      name: "Wisconsin Location",
      address: "890 Elm Grove Rd, Building 1 Suite 105, Elm Grove, WI 53122",
      mapQuery: "890 Elm Grove Rd, Elm Grove, WI 53122",
      hours: ["Showroom hours by appointment only"],
    },
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
