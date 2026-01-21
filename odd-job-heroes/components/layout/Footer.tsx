import Link from "next/link";

const PHONE_NUMBER = "(555) 123-4567";
const EMAIL = "[email protected]";
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white mt-auto">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">🦸 Odd Job Heroes</h3>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Small jobs. Big relief. Reliable help for seniors and families.
            </p>
            <div className="space-y-2">
              <a
                href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, "")}`}
                className="block text-lg text-neutral-300 hover:text-white transition-colors"
              >
                📞 {PHONE_NUMBER}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="block text-lg text-neutral-300 hover:text-white transition-colors"
              >
                ✉️ {EMAIL}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services"
                  className="text-lg text-neutral-300 hover:text-white transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-lg text-neutral-300 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-lg text-neutral-300 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/book"
                  className="text-lg text-neutral-300 hover:text-white transition-colors font-semibold"
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xl font-semibold mb-4">About</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-lg text-neutral-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="text-lg text-neutral-300 hover:text-white transition-colors"
                >
                  Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/service-area"
                  className="text-lg text-neutral-300 hover:text-white transition-colors"
                >
                  Service Area
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-lg text-neutral-300 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-lg text-neutral-300 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Signals */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Why Choose Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <span className="text-xl">✓</span>
                <span className="text-lg text-neutral-300">
                  Reliable & On Time
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-xl">✓</span>
                <span className="text-lg text-neutral-300">
                  Respectful Service
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-xl">✓</span>
                <span className="text-lg text-neutral-300">Clear Pricing</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-xl">✓</span>
                <span className="text-lg text-neutral-300">
                  Senior-Friendly
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-neutral-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-lg text-neutral-400">
              © {CURRENT_YEAR} Odd Job Heroes. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/privacy"
                className="text-lg text-neutral-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-lg text-neutral-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cancellation"
                className="text-lg text-neutral-400 hover:text-white transition-colors"
              >
                Cancellation Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
