"use client";

import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<"job" | "hour">("job");

  return (
    <>
      {/* Header */}
      <section className="section bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container-custom text-center">
          <h1 className="heading-1 mb-6">Simple, Clear Pricing</h1>
          <p className="text-large max-w-3xl mx-auto">
            Choose what works best for you: predictable package pricing or
            simple hourly rates. No hidden fees, ever.
          </p>
        </div>
      </section>

      {/* Pricing Tabs */}
      <section className="section">
        <div className="container-custom">
          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-lg border-2 border-neutral-200 p-1 bg-white">
              <button
                onClick={() => setActiveTab("job")}
                className={`px-8 py-4 rounded-lg text-xl font-semibold transition-all ${
                  activeTab === "job"
                    ? "bg-primary text-white"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                By Job (Recommended)
              </button>
              <button
                onClick={() => setActiveTab("hour")}
                className={`px-8 py-4 rounded-lg text-xl font-semibold transition-all ${
                  activeTab === "hour"
                    ? "bg-primary text-white"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                By Hour
              </button>
            </div>
          </div>

          {/* By Job Tab */}
          {activeTab === "job" && (
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="text-center mb-12">
                <h2 className="heading-2 mb-4">Package Pricing</h2>
                <p className="text-xl text-neutral-700">
                  Know exactly what you'll pay before we start. Perfect for
                  seniors who prefer predictable costs.
                </p>
              </div>

              {/* Pricing Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="text-left p-6 text-xl font-semibold text-neutral-900 border-b-2 border-neutral-300">
                        Job Type
                      </th>
                      <th className="text-left p-6 text-xl font-semibold text-neutral-900 border-b-2 border-neutral-300">
                        Price Range
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {packagePricing.map((pkg, index) => (
                      <tr
                        key={index}
                        className="border-b border-neutral-200 hover:bg-neutral-50"
                      >
                        <td className="p-6">
                          <p className="text-lg font-semibold text-neutral-900">
                            {pkg.job}
                          </p>
                          <p className="text-base text-neutral-600 mt-1">
                            {pkg.description}
                          </p>
                        </td>
                        <td className="p-6">
                          <p className="text-2xl font-bold text-primary">
                            {pkg.price}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              <div className="card bg-blue-50 border-blue-200">
                <h3 className="text-2xl font-semibold mb-4">
                  How Package Pricing Works
                </h3>
                <ul className="space-y-3">
                  {packageNotes.map((note, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-2xl flex-shrink-0">✓</span>
                      <span className="text-lg text-neutral-700">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Photo Estimate CTA */}
              <div className="card bg-secondary/10 border-secondary/30 text-center">
                <h3 className="heading-3 mb-4">Want an exact quote?</h3>
                <p className="text-xl text-neutral-700 mb-6">
                  Upload a photo and we'll send you a custom estimate within 2
                  hours.
                </p>
                <Link href="/book?step=photo" className="btn btn-secondary">
                  📸 Upload Photo for Estimate
                </Link>
              </div>
            </div>
          )}

          {/* By Hour Tab */}
          {activeTab === "hour" && (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center mb-12">
                <h2 className="heading-2 mb-4">Hourly Rate</h2>
                <p className="text-xl text-neutral-700">
                  Simple and fair. Pay only for the time we work.
                </p>
              </div>

              {/* Main Rate Card */}
              <div className="card text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
                <div className="text-6xl font-bold text-primary mb-4">
                  $75/hour
                </div>
                <p className="text-2xl text-neutral-700 mb-2">
                  2 hour minimum
                </p>
                <p className="text-lg text-neutral-600">
                  = $150 minimum charge
                </p>
              </div>

              {/* What's Included */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="heading-3 mb-4">✓ What's Included</h3>
                  <ul className="space-y-3">
                    {hourlyIncluded.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-xl flex-shrink-0">•</span>
                        <span className="text-lg text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h3 className="heading-3 mb-4">Best For</h3>
                  <ul className="space-y-3">
                    {hourlyBestFor.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-xl flex-shrink-0">→</span>
                        <span className="text-lg text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Additional Fees */}
              <div className="card bg-yellow-50 border-yellow-200">
                <h3 className="text-2xl font-semibold mb-4">
                  Additional Fees (When Applicable)
                </h3>
                <div className="space-y-4">
                  {additionalFees.map((fee, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start border-b border-yellow-200 pb-3 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-neutral-900">
                          {fee.name}
                        </p>
                        <p className="text-base text-neutral-600">
                          {fee.description}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-primary ml-4">
                        {fee.fee}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div className="card">
                <h3 className="heading-3 mb-6">How Hourly Billing Works</h3>
                <div className="space-y-4">
                  {hourlyProcess.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg text-neutral-700">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container-custom text-center space-y-8">
          <h2 className="heading-2 text-white">Ready to book?</h2>
          <p className="text-2xl opacity-90 max-w-2xl mx-auto">
            Choose your pricing option and let's get started.
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
              📞 Call for Questions
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// Data
const packagePricing = [
  {
    job: "Single appliance haul-away",
    description: "Refrigerator, washer, dryer, etc.",
    price: "$125–$175",
  },
  {
    job: "Furniture removal (1 room)",
    description: "Couch, chairs, tables, etc.",
    price: "$150–$250",
  },
  {
    job: "Furniture rearrange",
    description: "Move existing furniture within home",
    price: "$100–$150",
  },
  {
    job: "Yard cleanup (seasonal)",
    description: "Leaf removal, branch hauling, 1-2 hours",
    price: "$150–$250",
  },
  {
    job: "Garage cleanout (basic)",
    description: "Sorting, organizing, hauling away unwanted items",
    price: "$300–$500",
  },
  {
    job: "Picture hanging (up to 5)",
    description: "Walls, mirrors, shelves",
    price: "$75–$125",
  },
  {
    job: "Furniture assembly",
    description: "IKEA, Amazon, simple pieces",
    price: "$100–$200",
  },
  {
    job: "Basic handyman work (2-3 hours)",
    description: "Small repairs, adjustments, installations",
    price: "$150–$225",
  },
];

const packageNotes = [
  "Prices include labor, disposal, and basic materials",
  "Stairs, heavy items (>50 lbs), or distance may add $25-$50",
  "Exact quote provided after photo or phone description",
  "Most jobs take 1-3 hours to complete",
  "All quotes are good for 7 days",
];

const hourlyIncluded = [
  "All labor and time on-site",
  "Basic tools and equipment",
  "Cleanup after the job",
  "No hidden fees or surprises",
];

const hourlyBestFor = [
  "Jobs with undefined scope",
  "Multi-task projects",
  "Ongoing maintenance help",
  "Flexible, open-ended work",
];

const additionalFees = [
  {
    name: "Disposal fees",
    description: "For items requiring special disposal (mattresses, e-waste)",
    fee: "$15–$50",
  },
  {
    name: "Materials",
    description: "If we need to purchase specific items (discussed beforehand)",
    fee: "Cost + 15%",
  },
  {
    name: "Travel (>15 miles)",
    description: "For jobs outside our primary service area",
    fee: "$2/mile",
  },
];

const hourlyProcess = [
  "We arrive and assess the job together",
  "Time starts when we begin working",
  "We work steadily and keep you updated on progress",
  "Time stops when the job is complete",
  "You pay for actual time worked (rounded to nearest 15 min)",
];
