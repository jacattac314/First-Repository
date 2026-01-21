import Link from "next/link";

export const metadata = {
  title: "Contact Us | Odd Job Heroes",
  description:
    "Get in touch with Odd Job Heroes. Call, text, email, or use our contact form. We're here to help.",
};

const PHONE = "(555) 123-4567";
const EMAIL = "[email protected]";
const ADDRESS = "Springfield, IL";

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="section bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container-custom text-center">
          <h1 className="heading-1 mb-6">Get in Touch</h1>
          <p className="text-large max-w-3xl mx-auto">
            Questions? Need a quote? We're here to help.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="section">
        <div className="container-custom max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Phone */}
            <a
              href={`tel:${PHONE.replace(/[^0-9]/g, "")}`}
              className="card card-hover text-center"
            >
              <div className="text-6xl mb-4">📞</div>
              <h3 className="heading-3 mb-3">Call Us</h3>
              <p className="text-2xl font-bold text-primary mb-2">{PHONE}</p>
              <p className="text-lg text-neutral-600">
                Monday–Saturday
                <br />
                8am–6pm
              </p>
            </a>

            {/* Email */}
            <a
              href={`mailto:${EMAIL}`}
              className="card card-hover text-center"
            >
              <div className="text-6xl mb-4">✉️</div>
              <h3 className="heading-3 mb-3">Email Us</h3>
              <p className="text-xl text-primary mb-2 break-words">{EMAIL}</p>
              <p className="text-lg text-neutral-600">
                We usually respond
                <br />
                within a few hours
              </p>
            </a>

            {/* Text/SMS */}
            <a
              href={`sms:${PHONE.replace(/[^0-9]/g, "")}`}
              className="card card-hover text-center"
            >
              <div className="text-6xl mb-4">💬</div>
              <h3 className="heading-3 mb-3">Text Us</h3>
              <p className="text-2xl font-bold text-primary mb-2">{PHONE}</p>
              <p className="text-lg text-neutral-600">
                Send us a text
                <br />
                anytime
              </p>
            </a>
          </div>

          {/* Contact Form */}
          <div className="card max-w-3xl mx-auto">
            <h2 className="heading-2 text-center mb-8">Send Us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xl font-semibold mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xl font-semibold mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xl font-semibold mb-2"
                >
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="[email protected]"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-xl font-semibold mb-2"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a topic...</option>
                  <option value="quote">Request a Quote</option>
                  <option value="question">General Question</option>
                  <option value="scheduling">Scheduling</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xl font-semibold mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Tell us what you need help with..."
                />
              </div>

              <button type="submit" className="btn btn-primary w-full btn-large">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section bg-neutral-50">
        <div className="container-custom text-center">
          <h2 className="heading-2 mb-6">Where We Work</h2>
          <p className="text-xl text-neutral-700 mb-8">
            Proudly serving {ADDRESS} and surrounding areas
          </p>
          <Link href="/service-area" className="btn btn-primary">
            View Full Service Area
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section bg-primary text-white">
        <div className="container-custom">
          <h2 className="heading-2 text-white text-center mb-12">
            Or Skip the Form
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link
              href="/book"
              className="card bg-white text-neutral-900 text-center hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-2xl font-semibold mb-3">Book Online</h3>
              <p className="text-lg text-neutral-600">
                Fast and easy booking form
              </p>
            </Link>

            <Link
              href="/book?step=photo"
              className="card bg-white text-neutral-900 text-center hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-2xl font-semibold mb-3">Upload a Photo</h3>
              <p className="text-lg text-neutral-600">
                Get an estimate from a photo
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
