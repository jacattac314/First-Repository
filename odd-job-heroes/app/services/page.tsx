import Link from "next/link";

export const metadata = {
  title: "Our Services | Odd Job Heroes",
  description:
    "Professional hauling, handyman services, yard work, and general labor. We handle the odd jobs that pile up.",
};

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="section bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container-custom text-center">
          <h1 className="heading-1 mb-6">Our Services</h1>
          <p className="text-large max-w-3xl mx-auto">
            From hauling to handyman work, we handle the jobs that pile up. If
            it needs doing, we can probably help.
          </p>
        </div>
      </section>

      {/* Services Details */}
      {services.map((service, index) => (
        <section
          key={service.slug}
          id={service.slug}
          className={`section ${index % 2 === 0 ? "bg-white" : "bg-neutral-50"}`}
        >
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="text-6xl mb-4">{service.icon}</div>
                <h2 className="heading-2 mb-4">{service.name}</h2>
                <p className="text-large text-neutral-700">
                  {service.description}
                </p>
              </div>

              {/* Common Jobs */}
              <div className="mb-12">
                <h3 className="heading-3 mb-6">Common Jobs We Handle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.commonJobs.map((job, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 p-4 rounded-lg bg-white border border-neutral-200"
                    >
                      <span className="text-2xl flex-shrink-0">✓</span>
                      <span className="text-lg text-neutral-700">{job}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What to Expect */}
              <div className="mb-12">
                <h3 className="heading-3 mb-6">What to Expect</h3>
                <div className="card space-y-4">
                  {service.expectations.map((expectation, idx) => (
                    <div key={idx} className="flex items-start space-x-4">
                      <span className="text-3xl flex-shrink-0">
                        {expectation.icon}
                      </span>
                      <div>
                        <h4 className="text-xl font-semibold text-neutral-900 mb-2">
                          {expectation.title}
                        </h4>
                        <p className="text-lg text-neutral-700 leading-relaxed">
                          {expectation.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Guidance */}
              <div className="card bg-primary/5 border-primary/20">
                <h3 className="heading-3 mb-4">Pricing Guidance</h3>
                <p className="text-lg text-neutral-700 mb-6">
                  {service.pricingNote}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/pricing" className="btn btn-primary">
                    View Pricing
                  </Link>
                  <Link href="/book?step=photo" className="btn btn-outline">
                    📸 Upload Photo for Estimate
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Not Sure Section */}
      <section className="section bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container-custom text-center space-y-8">
          <div className="text-6xl">❓</div>
          <h2 className="heading-2 text-white">Don't see your job listed?</h2>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            These are just examples. We've handled all kinds of odd jobs over
            the years. If you need something done, just ask!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="btn btn-large bg-white text-primary hover:bg-neutral-100"
            >
              Contact Us
            </Link>
            <a
              href="tel:5551234567"
              className="btn btn-large border-2 border-white text-white hover:bg-white hover:text-primary"
            >
              📞 Call (555) 123-4567
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// Data
const services = [
  {
    name: "Hauling & Moving Help",
    icon: "🚚",
    slug: "hauling",
    description:
      "Need to get rid of old furniture, appliances, or just clear out space? We'll haul it away and dispose of it properly.",
    commonJobs: [
      "Single appliance removal (fridge, washer, etc.)",
      "Furniture haul-away (couches, beds, tables)",
      "Estate cleanout assistance",
      "Garage or basement clearing",
      "Donation drop-offs (Goodwill, etc.)",
      "Recycling center runs",
      "Moving help (local moves, single items)",
      "Storage unit loading/unloading",
    ],
    expectations: [
      {
        icon: "⏱️",
        title: "Time Commitment",
        description:
          "Most hauling jobs take 1-3 hours depending on size and stairs. We'll give you an estimate upfront.",
      },
      {
        icon: "🏠",
        title: "Our Process",
        description:
          "We protect your floors and doorways, safely remove items, and clean up afterward. You don't lift a finger.",
      },
      {
        icon: "♻️",
        title: "Disposal",
        description:
          "We donate what we can and recycle when possible. Disposal fees are included in most estimates.",
      },
    ],
    pricingNote:
      "Most hauling jobs range from $100-$300 depending on size and disposal needs. Upload a photo for an accurate quote.",
  },
  {
    name: "Handyman / Basic Repairs",
    icon: "🔨",
    slug: "handyman",
    description:
      "Small repairs and improvements that don't need a licensed contractor. We handle the fixes that have been on your to-do list.",
    commonJobs: [
      "Picture and mirror hanging",
      "Furniture assembly (IKEA, Amazon, etc.)",
      "Shelf installation",
      "Door adjustments (sticking, squeaking)",
      "Cabinet hardware replacement",
      "Light fixture replacement (not electrical)",
      "Weatherstripping and draft sealing",
      "Minor drywall repairs (small holes)",
    ],
    expectations: [
      {
        icon: "🔧",
        title: "Tools & Materials",
        description:
          "We bring basic tools. If special materials are needed (shelves, hardware), we'll discuss beforehand.",
      },
      {
        icon: "⚡",
        title: "What We Don't Do",
        description:
          "No electrical wiring, plumbing connections, or structural work. We'll refer you to licensed pros when needed.",
      },
      {
        icon: "👍",
        title: "Quality Work",
        description:
          "Every job is done right. If something isn't level or doesn't work smoothly, we fix it before we leave.",
      },
    ],
    pricingNote:
      "Most handyman jobs are billed by the hour ($75/hr, 2 hour minimum) or as flat-rate packages. Picture hanging starts at $50.",
  },
  {
    name: "Yard Work & Cleanup",
    icon: "🌳",
    slug: "yard-work",
    description:
      "Keep your yard looking good without the heavy lifting. Seasonal cleanups, hauling, and basic maintenance.",
    commonJobs: [
      "Leaf removal and bagging",
      "Branch and debris hauling",
      "Gutter cleaning (single-story)",
      "Yard waste disposal",
      "Basic trimming (bushes, small trees)",
      "Seasonal cleanup (spring/fall)",
      "Patio and deck cleaning",
      "Outdoor furniture arrangement",
    ],
    expectations: [
      {
        icon: "🍂",
        title: "Seasonal Work",
        description:
          "Fall and spring are our busiest times. Book ahead for leaf removal and spring cleanups.",
      },
      {
        icon: "🚫",
        title: "Limitations",
        description:
          "We don't do landscaping design, tree removal, or power equipment (mowing, tilling). Just the cleanup and hauling.",
      },
      {
        icon: "🗑️",
        title: "Disposal Included",
        description:
          "We bag everything and haul it away. Yard waste disposal fees are included in the estimate.",
      },
    ],
    pricingNote:
      "Yard work typically runs $150-$400 depending on size and scope. Most leaf removals take 2-4 hours.",
  },
  {
    name: "General Labor",
    icon: "💪",
    slug: "general-labor",
    description:
      "The catch-all category. Heavy lifting, organization, moving things around—whatever you need an extra pair of hands for.",
    commonJobs: [
      "Garage organization and cleanup",
      "Storage shed clearing",
      "Furniture rearranging",
      "Heavy item moving (safes, pianos with help)",
      "Basement organizing",
      "Attic cleanup (within reason)",
      "Holiday decoration help (putting up/taking down)",
      "General odd jobs and errands",
    ],
    expectations: [
      {
        icon: "💬",
        title: "Just Ask",
        description:
          "If it's legal, safe, and we can physically do it, we'll say yes. This category is for everything else.",
      },
      {
        icon: "⏰",
        title: "Flexible Scheduling",
        description:
          "General labor is usually billed by the hour. We work at a steady pace and keep you updated.",
      },
      {
        icon: "🤝",
        title: "Your Helper",
        description:
          "Think of us as an extra family member who actually shows up to help with projects. No job too odd.",
      },
    ],
    pricingNote:
      "General labor is $75/hour with a 2-hour minimum. Larger projects can be quoted as flat-rate packages.",
  },
];
