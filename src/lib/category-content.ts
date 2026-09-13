// SEO copy + FAQs for each product category page, keyed by category slug.
// Kept out of the page component since it's mostly prose. Facts here are
// either sitewide-confirmed (minimum order, lead times) or generic
// event-industry knowledge (tablecloth drop math, spandex vs. draped cloth) —
// nothing product-specific was invented (e.g. no exact napkin/runner/cuff
// dimensions, since the catalog doesn't track those as a real size value).

const MINIMUM_FAQ = {
  q: "Is there a minimum order?",
  a: "$250 for locally delivered orders, $500 for shipped orders.",
};

const LEAD_TIME_FAQ = {
  q: "How far ahead should I order?",
  a: "Local delivery needs to be confirmed at least 2 business days before your event. Shipped orders depend on your UPS delivery zone — tell us your event date and we'll work back from it.",
};

export type CategoryContent = {
  title: string;
  description: string;
  intro: string[];
  faqs: { q: string; a: string }[];
};

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  "tablecloths-and-overlays": {
    title: "Tablecloth Rentals Chicago & Milwaukee",
    description:
      "Rent tablecloths and overlays in every color, fabric and size for weddings, galas and corporate events across Chicago and Milwaukee. Delivered pressed and ready.",
    intro: [
      `A tablecloth is the single biggest visual commitment on any table, and the right size makes the difference between a finished look and a cloth that just sits there. We stock round tablecloths from 90" up to 132", square cloths from 54" up to 132", and banquet sizes up to 114" x 180" — enough range to dress everything from a cocktail table to a twenty-foot head table.`,
      `Sizing follows a simple rule: for a floor-length drop, add twice your desired drop to your table's diameter or width. A 60" round table with a full drop to the floor needs a 120" round cloth; a 72" round wants a 132" round. If you'd rather not do the math, send us your venue's table list and we'll tell you exactly what to order.`,
      `Overlays work the same way in miniature — a smaller cloth, often square, layered on top of a base cloth for contrast, texture or a pop of color, without covering the whole table in a second fabric. Every tablecloth is cleaned and pressed before it goes out.`,
    ],
    faqs: [
      {
        q: "What size tablecloth do I need?",
        a: `For a floor-length drop, add twice your desired drop to your table's diameter — a 60" round table with a full drop to the floor needs a 120" round cloth. Send us your venue's table list and we'll confirm the right size for every table.`,
      },
      {
        q: "What's the difference between a tablecloth and an overlay?",
        a: "A tablecloth covers the whole table to your chosen drop length. An overlay is a smaller cloth — often square — layered on top of a base tablecloth for contrast or texture, without a full second cloth's worth of fabric.",
      },
      MINIMUM_FAQ,
      LEAD_TIME_FAQ,
    ],
  },

  napkins: {
    title: "Napkin Rentals Chicago & Milwaukee",
    description:
      "Rent napkins in every color and fabric to coordinate with your tablecloth, runner or chair covers. Cleaned, pressed and delivered for Chicago and Milwaukee events.",
    intro: [
      "Napkins are the easiest way to add a second color or texture to a table without committing to it everywhere — a contrast napkin on a Classic Solid cloth, or a metallic fold against a matte fabric, changes the feel of a place setting for a fraction of the cost of a specialty tablecloth.",
      "Our napkin colors track the same palette as our tablecloths and runners fabric-for-fabric, so matching — or deliberately not matching — is straightforward. Pick a tablecloth first and we can point you to napkins that either blend in or stand out. Every napkin goes out pressed flat and ready to fold however your event calls for.",
    ],
    faqs: [
      {
        q: "Can I mix napkin colors with my tablecloth?",
        a: "Yes — napkin colors track the same fabrics as our tablecloths and runners, so you can match tone-for-tone or pick a deliberate contrast. Tell us your tablecloth choice and we can suggest napkin pairings.",
      },
      MINIMUM_FAQ,
      LEAD_TIME_FAQ,
    ],
  },

  "table-runners": {
    title: "Table Runner Rentals Chicago & Milwaukee",
    description:
      "Rent table runners to layer over any tablecloth for weddings, galas and corporate events across Chicago and Milwaukee. Cleaned, pressed and delivered.",
    intro: [
      "A table runner is the simplest way to add pattern or texture to a table without changing the base color underneath — run it the length of a banquet table, or crosswise on a round, over any tablecloth in the collection.",
      "Runners pair especially well with a Classic Solid or neutral base cloth, letting a patterned or textured fabric do the visual work down the center of the table. Many events use two runners crossed at the center of a round table, or one running the full length of a long banquet or farm table. Because runners share the same fabric library as our tablecloths, you can match a runner to napkins, an overlay or a chair sash from the same collection.",
    ],
    faqs: [
      {
        q: "How do I use a table runner?",
        a: "Runners are layered over a base tablecloth — running the length of a long table, or crosswise over a round table. Many events use two runners crossed at the center of a round table for a fuller look.",
      },
      MINIMUM_FAQ,
      LEAD_TIME_FAQ,
    ],
  },

  cuffs: {
    title: "Linen Cuff Rentals Chicago & Milwaukee",
    description:
      "Rent linen cuffs — a fabric accent band for chairs, tables and decor — in colors and fabrics to match your event. Serving Chicago and Milwaukee.",
    intro: [
      "A cuff is a fabric band — a focused pop of color or texture without the commitment of dressing a whole surface in it. It's an easy way to bring a second fabric into a room: a chair back, a portion of a table, or a decor element, wrapped in a color that might be too much as a full tablecloth but works perfectly as an accent.",
      "Because cuffs share our full fabric and color library, they're a low-cost way to bring in a bold color or specialty fabric without committing to it at scale, or simply to add a finishing detail to a look otherwise built around neutrals. Not sure how a cuff would work for your event? Tell our team what you're picturing and they'll help you figure out where it fits.",
    ],
    faqs: [
      {
        q: "What is a linen cuff used for?",
        a: "A cuff is a fabric accent band — commonly used on a chair back or a section of a table — for a focused pop of color or texture without dressing the whole surface in it.",
      },
      MINIMUM_FAQ,
      LEAD_TIME_FAQ,
    ],
  },

  spandex: {
    title: "Spandex Cover Rentals Chicago & Milwaukee",
    description:
      "Rent stretch-fit spandex table covers for a clean, wrinkle-free look at weddings and corporate events across Chicago and Milwaukee.",
    intro: [
      "A spandex cover is a stretch-fit alternative to a draped tablecloth — it pulls taut over the table for a smooth, seamless look with none of the folds or pooling of a traditional cloth. It's a common choice for cocktail tables, registration tables and trade-show booths, where a clean, modern line matters more than a formal drape.",
      "We stock spandex covers sized to our most common table shapes, so the fit is snug rather than loose. Because the fabric reads as a solid, unbroken surface, spandex covers work well under a runner, a centerpiece or branded signage without competing for attention. If you're not sure whether a spandex cover or a traditional tablecloth is the better fit, tell us the setting and we'll help you decide.",
    ],
    faqs: [
      {
        q: "What's the difference between a spandex cover and a tablecloth?",
        a: "A spandex cover stretches taut over the table for a smooth, seamless look with no folds or pooling. A tablecloth drapes with a soft fall to whatever length you choose. Spandex suits a clean, modern look; a tablecloth suits a more formal drape.",
      },
      MINIMUM_FAQ,
      LEAD_TIME_FAQ,
    ],
  },

  "chair-covers": {
    title: "Chair Cover Rentals Chicago & Milwaukee",
    description:
      "Rent chair covers for weddings, galas and corporate events across Chicago and Milwaukee. Coordinating sashes available. Cleaned, pressed and delivered.",
    intro: [
      "Chair covers turn a room full of mismatched banquet or folding chairs into a uniform, finished look in one pass — especially useful at a venue where the house chairs aren't the style you want in your photos.",
      "Covers are sized for standard banquet and folding chairs; tell us what your venue provides and we'll confirm the right fit before your event. Pair a cover with a sash or cuff from our fabric library for a coordinating accent at the chair back, or keep it simple with a clean, solid cover throughout the room. Chiavari and specialty chairs are usually left uncovered and dressed with a sash or cuff instead, since their frame is part of the look — ask our team if you're not sure which approach fits your venue's chairs.",
    ],
    faqs: [
      {
        q: "Will your chair covers fit my venue's chairs?",
        a: "Our covers are sized for standard banquet and folding chairs. Tell us what your venue provides and we'll confirm the right fit — chiavari and specialty chairs are usually dressed with a sash instead of a full cover.",
      },
      MINIMUM_FAQ,
      LEAD_TIME_FAQ,
    ],
  },
};
