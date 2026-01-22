import Link from "next/link";

export const metadata = {
  title: "How It Works | Odd Job Heroes",
  description:
    "Simple, straightforward process. Tell us what you need, get a quote, and we show up to help.",
};

export default function HowItWorksPage() {
  return (
    <>
      {/* Header */}
      <section className="section bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container-custom text-center">
          <h1 className="heading-1 mb-6">How It Works</h1>
          <p className="text-large max-w-3xl mx-auto">
            We make getting help as easy as possible. Three simple steps.
          </p>
        </div>
      </section>

      {/* Main Steps */}
      <section className="section">
        <div className="container-custom max-w-4xl">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row gap-8 items-center mb-16 last:mb-0 ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Number Circle */}
              <div className="flex-shrink-0 w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center text-5xl font-bold shadow-lg">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="heading-2 mb-4">{step.title}</h2>
                <p className="text-xl text-neutral-700 leading-relaxed mb-6">
                  {step.description}
                </p>
                <ul className="space-y-3">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="text-2xl flex-shrink-0">✓</span>
                      <span className="text-lg text-neutral-600">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-neutral-50">
        <div className="container-custom">
          <h2 className="heading-2 text-center mb-12">
            Why Customers Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-lg text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container-custom text-center space-y-8">
          <h2 className="heading-2 text-white">Ready to get started?</h2>
          <p className="text-2xl opacity-90">
            Book online or call us. We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="btn btn-large bg-white text-primary hover:bg-neutral-100"
            >
              Book Now
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
const steps = [
  {
    title: "Tell Us What You Need",
    description:
      "The first step is simple: let us know what job you need help with.",
    details: [
      "Call us at (555) 123-4567",
      "Book online through our simple form",
      "Upload a photo for faster estimates",
      "Text or email if that's easier for you",
    ],
  },
  {
    title: "Get a Clear Estimate",
    description:
      "We'll give you a straightforward quote. No hidden fees, no surprises.",
    details: [
      "Estimate usually within 2 hours (often faster)",
      "Choose between package pricing or hourly rates",
      "All costs explained clearly",
      "Estimate good for 7 days",
    ],
  },
  {
    title: "We Show Up and Get It Done",
    description:
      "On the scheduled day, we arrive on time and handle the job with care.",
    details: [
      "Confirmation reminder the day before",
      "Arrive within your chosen time window",
      "Work efficiently and respectfully",
      "Clean up when we're done",
    ],
  },
];

const features = [
  {
    icon: "📞",
    title: "Easy Booking",
    description: "Online, phone, text, or email—whatever works for you",
  },
  {
    icon: "💰",
    title: "Clear Pricing",
    description: "Know what you'll pay before we start. No surprises.",
  },
  {
    icon: "⏰",
    title: "On Time",
    description: "We show up when we say we will. Your time matters.",
  },
  {
    icon: "🤝",
    title: "Respectful",
    description: "We treat your home and property with care and respect.",
  },
];
