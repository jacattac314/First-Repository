"use client";

import { useState } from "react";
import Link from "next/link";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Header */}
      <section className="section bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container-custom text-center">
          <h1 className="heading-1 mb-6">Frequently Asked Questions</h1>
          <p className="text-large max-w-3xl mx-auto">
            Common questions about our services, pricing, and how we work.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="section">
        <div className="container-custom max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card border-2 border-neutral-200">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left flex justify-between items-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                >
                  <span className="heading-3 pr-8">{faq.question}</span>
                  <span className="text-3xl flex-shrink-0 text-primary">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <p className="text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="section bg-primary text-white">
        <div className="container-custom text-center space-y-8">
          <h2 className="heading-2 text-white">Still have questions?</h2>
          <p className="text-2xl opacity-90">
            We're happy to help. Give us a call or send a message.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:5551234567"
              className="btn btn-large bg-white text-primary hover:bg-neutral-100"
            >
              📞 Call (555) 123-4567
            </a>
            <Link
              href="/contact"
              className="btn btn-large border-2 border-white text-white hover:bg-white hover:text-primary"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// Data
const faqs = [
  {
    question: "How do I get an estimate?",
    answer: `You can get an estimate three ways:

1. Call us at (555) 123-4567 and describe the job
2. Fill out our online booking form
3. Upload a photo and we'll send you a quote (usually within 2 hours)

All estimates are free and there's no obligation.`,
  },
  {
    question: "What's the difference between 'By Job' and 'By Hour' pricing?",
    answer: `"By Job" pricing means you get a flat rate for the entire job. You know exactly what you'll pay before we start. This is great for specific tasks like moving a couch or hanging pictures.

"By Hour" pricing is $75/hour (2 hour minimum). You pay for the time we actually work. This works better for open-ended projects or when you have multiple tasks.

Not sure which is better? We'll recommend the best option when you contact us.`,
  },
  {
    question: "Do you work with seniors?",
    answer: `Yes! Many of our customers are seniors or their adult children booking services for their parents. We're patient, respectful, and take the time to explain everything clearly.

Our website and booking process are designed to be easy to use. But if you prefer to talk to a person, just call—we're happy to help over the phone.`,
  },
  {
    question: "What areas do you serve?",
    answer: `We serve Springfield and surrounding communities within about 15 miles of downtown.

If you're outside our primary service area, we can still help—there may be a small travel fee. Just ask when you contact us!`,
  },
  {
    question: "How quickly can you come out?",
    answer: `It depends on how busy we are, but many jobs can be scheduled within 2-3 days. If it's urgent (like you need something done today or tomorrow), let us know and we'll do our best to accommodate you.

During our busy seasons (spring and fall for yard work), it's best to book a week or two ahead if possible.`,
  },
  {
    question: "Do I need to provide tools or equipment?",
    answer: `No! We bring all the basic tools and equipment we need.

If a job requires specific materials (like shelves you want installed or special hardware), we'll discuss that beforehand. You can either provide them or we can pick them up for you (cost of materials plus a small fee).`,
  },
  {
    question: "What payment methods do you accept?",
    answer: `We accept:
• Cash
• Check
• Venmo/Cash App
• Credit/debit cards (in select cases)

Payment is due when the job is complete. We'll discuss payment details when we give you the estimate.`,
  },
  {
    question: "Are you licensed and insured?",
    answer: `Yes, we carry liability insurance for your peace of mind.

For jobs that require specific licenses (like electrical or plumbing work), we'll refer you to licensed professionals. We focus on the "odd jobs" that don't require special licensing.`,
  },
  {
    question: "What if I need to cancel or reschedule?",
    answer: `Life happens! Just give us a call as soon as you know you need to change the appointment.

If you cancel or reschedule with at least 24 hours notice, there's no fee. Last-minute cancellations (less than 24 hours) may include a small cancellation fee.`,
  },
  {
    question: "What jobs do you NOT do?",
    answer: `We don't handle jobs that require special licenses or certifications, including:
• Electrical wiring
• Plumbing connections
• HVAC work
• Tree removal (large trees)
• Roofing

If you ask about something we can't do, we'll be honest and can often recommend someone who can help.`,
  },
];
