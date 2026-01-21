import Link from "next/link";

const PHONE_NUMBER = "(555) 123-4567";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="section bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="heading-1">
              Odd Job Heroes — Help for the jobs that pile up.
            </h1>
            <p className="text-large max-w-3xl mx-auto">
              Reliable help for seniors. Hauling, repairs, yard work, and
              everything in between.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/book" className="btn btn-primary btn-large">
                Book Now
              </Link>
              <Link href="/book?step=photo" className="btn btn-secondary">
                📸 Upload a Photo
              </Link>
              <a
                href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, "")}`}
                className="btn btn-outline"
              >
                📞 Call {PHONE_NUMBER}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Tiles */}
      <section className="section">
        <div className="container-custom">
          <h2 className="heading-2 text-center mb-12">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services#${service.slug}`}
                className="card card-hover group"
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="heading-3 mb-3 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  {service.description}
                </p>
                <span className="inline-block mt-4 text-primary font-semibold group-hover:underline">
                  Learn more →
                </span>
              </Link>
            ))}

            {/* Not Sure Card */}
            <Link
              href="/contact"
              className="card card-hover bg-neutral-50 border-2 border-dashed border-neutral-300 hover:border-primary transition-colors"
            >
              <div className="text-5xl mb-4">❓</div>
              <h3 className="heading-3 mb-3">Not sure? Ask us.</h3>
              <p className="text-lg text-neutral-600 leading-relaxed">
                If you have an odd job that needs doing, just ask. We've
                probably done it before!
              </p>
              <span className="inline-block mt-4 text-primary font-semibold">
                Contact us →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-neutral-50">
        <div className="container-custom">
          <h2 className="heading-2 text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="heading-3">{step.title}</h3>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="section">
        <div className="container-custom">
          <h2 className="heading-2 text-center mb-12">Clear, Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card text-center space-y-4">
              <h3 className="heading-3">By Job</h3>
              <p className="text-xl text-neutral-600">Know the price upfront</p>
              <div className="py-6">
                <p className="text-lg text-neutral-700">
                  Example: Appliance haul-away
                </p>
                <p className="text-4xl font-bold text-primary mt-2">$150</p>
              </div>
              <Link href="/pricing" className="btn btn-primary">
                See Packages
              </Link>
            </div>

            <div className="card text-center space-y-4">
              <h3 className="heading-3">By Hour</h3>
              <p className="text-xl text-neutral-600">Pay for time worked</p>
              <div className="py-6">
                <p className="text-4xl font-bold text-primary">$75/hour</p>
                <p className="text-lg text-neutral-700 mt-2">
                  2 hour minimum
                </p>
              </div>
              <Link href="/pricing" className="btn btn-primary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="section bg-primary text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {trustSignals.map((signal, index) => (
              <div key={index} className="space-y-3">
                <div className="text-4xl">{signal.icon}</div>
                <h3 className="text-2xl font-semibold">{signal.title}</h3>
                <p className="text-lg opacity-90">{signal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section">
        <div className="container-custom">
          <h2 className="heading-2 text-center mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="card space-y-4">
                <div className="flex items-center space-x-1 text-2xl text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <p className="text-lg text-neutral-700 leading-relaxed">
                  "{review.text}"
                </p>
                <div className="pt-4 border-t border-neutral-200">
                  <p className="font-semibold text-neutral-900">
                    {review.author}
                  </p>
                  <p className="text-neutral-600">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/reviews" className="btn btn-outline">
              Read More Reviews
            </Link>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="section bg-neutral-50">
        <div className="container-custom text-center">
          <h2 className="heading-2 mb-6">Proudly Serving Your Area</h2>
          <p className="text-large max-w-2xl mx-auto mb-8">
            We provide reliable service to Springfield and surrounding
            communities.
          </p>
          <Link href="/service-area" className="btn btn-primary">
            View Service Area
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container-custom text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to get help with your odd jobs?
          </h2>
          <p className="text-2xl opacity-90">
            Book online in minutes or give us a call.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/book"
              className="btn btn-large bg-white text-primary hover:bg-neutral-100"
            >
              Book Now
            </Link>
            <a
              href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, "")}`}
              className="btn btn-large border-2 border-white text-white hover:bg-white hover:text-primary"
            >
              📞 Call {PHONE_NUMBER}
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
    description:
      "Furniture removal, appliance haul-away, estate cleanouts, and donation drop-offs.",
    slug: "hauling",
  },
  {
    name: "Handyman / Basic Repairs",
    icon: "🔨",
    description:
      "Picture hanging, furniture assembly, door fixes, and small home repairs.",
    slug: "handyman",
  },
  {
    name: "Yard Work & Cleanup",
    icon: "🌳",
    description:
      "Leaf removal, branch hauling, basic trimming, and seasonal cleanup.",
    slug: "yard-work",
  },
  {
    name: "General Labor",
    icon: "💪",
    description:
      "Garage organization, storage solutions, heavy lifting, and whatever you need done.",
    slug: "general-labor",
  },
];

const steps = [
  {
    title: "Tell Us",
    description: "Call, book online, or upload a photo of the job.",
  },
  {
    title: "We Quote",
    description: "Get a clear estimate—by the job or by the hour.",
  },
  {
    title: "We Show Up",
    description: "We'll handle it with care and respect.",
  },
];

const trustSignals = [
  {
    icon: "✓",
    title: "Reliable",
    description: "Show up on time, every time",
  },
  {
    icon: "✓",
    title: "Respectful",
    description: "We treat your home like ours",
  },
  {
    icon: "✓",
    title: "Clear Pricing",
    description: "No surprises, ever",
  },
];

const reviews = [
  {
    text: "They moved my couch upstairs and were so patient. I felt safe having them in my home.",
    author: "Margaret S.",
    location: "Riverside",
  },
  {
    text: "Finally found someone who will do the small jobs! Hung all my pictures in under an hour.",
    author: "Robert T.",
    location: "Downtown",
  },
  {
    text: "I sent a photo of my cluttered garage and got an estimate the same day. Very impressed!",
    author: "Linda K.",
    location: "Hillside",
  },
];
