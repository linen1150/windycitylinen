import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Serving the event industry since 2008, Windy City Linen provides high-quality event linens with showrooms in Wheeling, IL and Elm Grove, WI.",
};

const TEAM = [
  {
    name: "Robert Spiro",
    title: "",
    bio: "Rob graduated from the University of Iowa with a BBA in accounting. He then spent ten years in public accounting, specializing in small business and tax planning. From there, he branched out and opened a dry cleaning business, where Rob oversaw the day-to-day operations. Taking advantage of an under-served market, Rob and his brother were able to grow the company to one of the largest dry cleaners on the North Shore. During his time there, Rob and his partners opened up Windy City Linen, started to provide a great service to another under-served market. By combining their production and retail experience, Rob and his partners were able to grow Windy City Linen into one of the premier providers of event linen in the Chicagoland area.",
  },
  {
    name: "Henry O'Young",
    title: "",
    bio: "Henry, one of the founders of Windy City Linen, is the organization's Director of Operations, working directly with department managers to achieve the company's goals. Henry prides himself on providing the best products and service to our clients. Prior to Windy City Linen, Henry came from a 3rd generation family of food manufacturing. Henry brings a wealth of management experience to the company.",
  },
  {
    name: "Marcela Aduna",
    title: "Managing Partner",
    bio: "With over 20 years of management experience, Marcela has proven her reliability and determination leading our daily operations and Sales teams, optimizing client experiences, and driving business development. Marcela joined the Windy City Linen team in 2009, growing from an ambitious Customer Service Representative to General Manager. Marcela's vast knowledge and experience in the linen industry has proven invaluable to the success of Windy City Linen. A member of the Catering Executive's Club and an active member in the special events industry, Marcela brings her passion for building and maintaining customer relationships to the forefront of her role. A Chicago native, Marcela enjoys traveling and spending quality time with family and friends.",
  },
  {
    name: "Debra Westfall",
    title: "Sales Representative",
    bio: "For years, Debra has been a shining star in our industry — her exuberant personality, client care and unwavering commitment have earned her numerous accolades. A true professional, she's built an impeccable reputation that is second-to-none. Debra is our team cheerleader, encouraging all to be the best personally and professionally, with her “Go Get 'em” motto. Debra's many affiliations include working as a Breast Cancer Mentor for Imerman's Angels and an active member of The Catering Executive's Club. Debra and her 3 French Bulldog children call the City of Chicago home, enjoying all its cultural and culinary experiences.",
  },
  {
    name: "Tera Stamm",
    title: "Sales Representative",
    bio: "A native of Wisconsin, Tera has achieved a lot in her 20 years in the special events industry. She is a role model for the entire Windy City brand. During her long and distinguished career in the hospitality field through various positions in the Milwaukee area, she never wavered in the values that have made her special to her team and customers alike: a positive outlook, incredible energy, strong leadership, and an ever-present smile. When not in the role of @terathelinenlady, she spends the nights as a “mom” uber, transporting kids to various sporting events or traveling with family.",
  },
  {
    name: "Brooke Marino",
    title: "Sales Representative",
    bio: "Our newest team member, Brooke is an outside sales specialist with over 20 years of sales experience. A native of the Chicago area her entire life, Brooke graduated from Southern Illinois University with a BS in Interior Architectural Design. In 2021, Brooke brought her experience in sales and the special event industry to Windy City Linen. “My combined passion for design and past professional background of Country Club Management and Event Planning makes event decor sales the perfect career for me! I love that my work takes me to the most beautiful spaces, gifted the opportunity to work with creative people and no two projects are ever the same.” She continues to live in the greater Chicago area, where she enjoys networking with organizations associated with professional and personal interests. Brooke aspires to establish and sustain strong relationships among the Windy City team and clients. In her free time, Brooke enjoys time with her friends, family including her Bernedoodle George Michael, and traveling.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
      <h1 className="font-display text-3xl">About Windy City Linen</h1>

      <section className="mt-6 max-w-2xl">
        <h2 className="font-display text-xl">Our Story</h2>
        <p className="mt-3 text-ink-soft">
          Serving the event industry since {SITE.since}, Windy City Linen is committed
          to providing high-quality linens you can count on with unparalleled customer
          service. Whether you need linens for an intimate gathering or a party of two
          thousand guests, we&rsquo;ve got you covered. Our warehouse is located in{" "}
          {SITE.showrooms[0]}, and the Wisconsin showroom is located in{" "}
          {SITE.showrooms[1]}. While our selection of linen styles and colors has grown
          dramatically, two things have remained constant since our humble beginnings:
          our total dedication to our customers and our drive to constantly improve.
          Windy City Linen delivers quality linens — every time.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl">Our Team</h2>
        <div className="mt-5 grid gap-8 sm:grid-cols-2">
          {TEAM.map((person) => (
            <div key={person.name}>
              <h3 className="font-display text-base">
                {person.name}
                {person.title && (
                  <span className="ml-2 text-xs font-normal uppercase tracking-wide text-brass-dark">
                    {person.title}
                  </span>
                )}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{person.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <ButtonLink href="/products" variant="primary">Browse the collection</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">Contact the team</ButtonLink>
      </div>
    </div>
  );
}
