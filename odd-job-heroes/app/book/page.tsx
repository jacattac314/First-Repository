"use client";

import { useState } from "react";
import Link from "next/link";

type PricingMode = "job" | "hour";
type ServiceCategory = "hauling" | "handyman" | "yard-work" | "general-labor";

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: "" as ServiceCategory | "",
    pricingMode: "job" as PricingMode,
    description: "",
    photos: [] as string[],
    name: "",
    phone: "",
    email: "",
    address: "",
    preferredContact: "phone" as "phone" | "sms" | "email",
    requestedDate: "",
    requestedWindow: "",
    urgency: "flexible" as "today" | "this_week" | "flexible",
  });

  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would POST to an API
    console.log("Form submitted:", formData);
    setStep(6); // Confirmation step
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="heading-1 mb-4">Book Your Service</h1>
          {step <= totalSteps && (
            <div className="flex items-center justify-center space-x-2 mb-6">
              {[...Array(totalSteps)].map((_, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg ${
                      index + 1 === step
                        ? "bg-primary text-white"
                        : index + 1 < step
                          ? "bg-primary/60 text-white"
                          : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        index + 1 < step ? "bg-primary/60" : "bg-neutral-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-xl text-neutral-600">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Form Steps */}
        <div className="card">
          {step === 1 && (
            <Step1
              formData={formData}
              setFormData={setFormData}
              nextStep={nextStep}
            />
          )}
          {step === 2 && (
            <Step2
              formData={formData}
              setFormData={setFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {step === 3 && (
            <Step3
              formData={formData}
              setFormData={setFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {step === 4 && (
            <Step4
              formData={formData}
              setFormData={setFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {step === 5 && (
            <Step5
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              prevStep={prevStep}
            />
          )}
          {step === 6 && <Confirmation />}
        </div>

        {/* Escape Hatch */}
        {step <= totalSteps && (
          <div className="text-center mt-8">
            <p className="text-lg text-neutral-600 mb-4">
              Prefer to talk to a person?
            </p>
            <a
              href="tel:5551234567"
              className="btn btn-outline inline-flex items-center space-x-2"
            >
              <span className="text-2xl">📞</span>
              <span>Call (555) 123-4567</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 1: Service Selection
function Step1({
  formData,
  setFormData,
  nextStep,
}: {
  formData: any;
  setFormData: any;
  nextStep: () => void;
}) {
  const services = [
    {
      id: "hauling",
      name: "Hauling & Moving Help",
      icon: "🚚",
      description: "Furniture removal, haul-away, moving help",
    },
    {
      id: "handyman",
      name: "Handyman / Basic Repairs",
      icon: "🔨",
      description: "Picture hanging, assembly, repairs",
    },
    {
      id: "yard-work",
      name: "Yard Work & Cleanup",
      icon: "🌳",
      description: "Leaf removal, trimming, seasonal cleanup",
    },
    {
      id: "general-labor",
      name: "General Labor",
      icon: "💪",
      description: "Heavy lifting, organization, odd jobs",
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="heading-2 text-center">What do you need help with?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => {
              setFormData({ ...formData, service: service.id });
              nextStep();
            }}
            className={`p-8 rounded-xl border-2 text-left transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              formData.service === service.id
                ? "border-primary bg-primary/5"
                : "border-neutral-200 hover:border-primary/50"
            }`}
          >
            <div className="text-5xl mb-4">{service.icon}</div>
            <h3 className="text-2xl font-semibold mb-2">{service.name}</h3>
            <p className="text-lg text-neutral-600">{service.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Pricing Mode
function Step2({
  formData,
  setFormData,
  nextStep,
  prevStep,
}: {
  formData: any;
  setFormData: any;
  nextStep: () => void;
  prevStep: () => void;
}) {
  return (
    <div className="space-y-8">
      <h2 className="heading-2 text-center">Choose your pricing option</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => {
            setFormData({ ...formData, pricingMode: "job" });
            nextStep();
          }}
          className={`p-8 rounded-xl border-2 text-left transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            formData.pricingMode === "job"
              ? "border-primary bg-primary/5"
              : "border-neutral-200 hover:border-primary/50"
          }`}
        >
          <div className="mb-4">
            <span className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold">
              RECOMMENDED
            </span>
          </div>
          <h3 className="text-2xl font-semibold mb-4">By Job</h3>
          <p className="text-lg text-neutral-600 mb-6">
            Know the price upfront. Perfect for specific tasks with clear scope.
          </p>
          <div className="space-y-2 text-base text-neutral-700">
            <p>✓ Predictable pricing</p>
            <p>✓ No surprises</p>
            <p>✓ Quote before we start</p>
          </div>
        </button>

        <button
          onClick={() => {
            setFormData({ ...formData, pricingMode: "hour" });
            nextStep();
          }}
          className={`p-8 rounded-xl border-2 text-left transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            formData.pricingMode === "hour"
              ? "border-primary bg-primary/5"
              : "border-neutral-200 hover:border-primary/50"
          }`}
        >
          <h3 className="text-2xl font-semibold mb-4">By Hour</h3>
          <p className="text-lg text-neutral-600 mb-6">
            Pay only for time worked. Great for flexible, multi-task projects.
          </p>
          <div className="space-y-2 text-base text-neutral-700">
            <p>• $75/hour</p>
            <p>• 2 hour minimum</p>
            <p>• Simple and fair</p>
          </div>
        </button>
      </div>
      <div className="flex justify-center">
        <button onClick={prevStep} className="btn btn-outline">
          ← Back
        </button>
      </div>
    </div>
  );
}

// Step 3: Job Details
function Step3({
  formData,
  setFormData,
  nextStep,
  prevStep,
}: {
  formData: any;
  setFormData: any;
  nextStep: () => void;
  prevStep: () => void;
}) {
  const canProceed = formData.description.trim().length > 10;

  return (
    <div className="space-y-8">
      <h2 className="heading-2 text-center">Tell us about the job</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-xl font-semibold mb-3">
            Describe what you need done
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Example: I need help moving a couch from my living room to the second floor bedroom. It's a standard 3-seater."
            rows={6}
            className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-base text-neutral-600 mt-2">
            The more details, the better estimate we can provide.
          </p>
        </div>

        <div className="card bg-secondary/10 border-secondary/30">
          <div className="flex items-start space-x-4">
            <span className="text-4xl">📸</span>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                Have a photo? Even better!
              </h3>
              <p className="text-lg text-neutral-700 mb-4">
                Upload a photo and we'll send you a more accurate estimate.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  alert("Photo upload would be implemented with file handling")
                }
              >
                📸 Upload Photo (Optional)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={prevStep} className="btn btn-outline">
          ← Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className={`btn btn-primary ${!canProceed ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// Step 4: Contact Information
function Step4({
  formData,
  setFormData,
  nextStep,
  prevStep,
}: {
  formData: any;
  setFormData: any;
  nextStep: () => void;
  prevStep: () => void;
}) {
  const canProceed =
    formData.name.trim() &&
    formData.phone.trim() &&
    formData.address.trim();

  return (
    <div className="space-y-8">
      <h2 className="heading-2 text-center">Your contact information</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-xl font-semibold mb-3">Your name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Smith"
            className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-xl font-semibold mb-3">
            Phone number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="(555) 123-4567"
            className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-xl font-semibold mb-3">
            Email (optional)
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="[email protected]"
            className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-xl font-semibold mb-3">
            Service address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="123 Main St, Springfield, IL 62701"
            className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-xl font-semibold mb-3">
            How should we contact you?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["phone", "sms", "email"].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, preferredContact: method })
                }
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.preferredContact === method
                    ? "border-primary bg-primary/5"
                    : "border-neutral-200 hover:border-primary/50"
                }`}
              >
                <span className="text-lg font-medium capitalize">{method}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={prevStep} className="btn btn-outline">
          ← Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className={`btn btn-primary ${!canProceed ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// Step 5: Scheduling
function Step5({
  formData,
  setFormData,
  handleSubmit,
  prevStep,
}: {
  formData: any;
  setFormData: any;
  handleSubmit: (e: React.FormEvent) => void;
  prevStep: () => void;
}) {
  const timeWindows = ["9–11am", "11–1pm", "1–3pm", "3–5pm"];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="heading-2 text-center">When do you need help?</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-xl font-semibold mb-3">
            How urgent is this?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "today", label: "Today", emoji: "🚨" },
              { id: "this_week", label: "This Week", emoji: "📅" },
              { id: "flexible", label: "Flexible", emoji: "👍" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, urgency: option.id })
                }
                className={`p-6 rounded-lg border-2 text-center transition-all ${
                  formData.urgency === option.id
                    ? "border-primary bg-primary/5"
                    : "border-neutral-200 hover:border-primary/50"
                }`}
              >
                <div className="text-3xl mb-2">{option.emoji}</div>
                <span className="text-lg font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xl font-semibold mb-3">
            Preferred date
          </label>
          <input
            type="date"
            value={formData.requestedDate}
            onChange={(e) =>
              setFormData({ ...formData, requestedDate: e.target.value })
            }
            min={new Date().toISOString().split("T")[0]}
            className="w-full text-lg p-4 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-xl font-semibold mb-3">
            Preferred time window
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {timeWindows.map((window) => (
              <button
                key={window}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, requestedWindow: window })
                }
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.requestedWindow === window
                    ? "border-primary bg-primary/5"
                    : "border-neutral-200 hover:border-primary/50"
                }`}
              >
                <span className="text-lg font-medium">{window}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={prevStep} className="btn btn-outline">
          ← Back
        </button>
        <button type="submit" className="btn btn-primary btn-large">
          Submit Request
        </button>
      </div>
    </form>
  );
}

// Confirmation
function Confirmation() {
  return (
    <div className="text-center space-y-8 py-8">
      <div className="text-7xl">✅</div>
      <h2 className="heading-2">Request Received!</h2>
      <div className="space-y-4 max-w-2xl mx-auto">
        <p className="text-xl text-neutral-700">
          Thank you for your request. We'll review it and get back to you within
          2 hours.
        </p>
        <div className="card bg-primary/5 border-primary/20 text-left">
          <h3 className="text-2xl font-semibold mb-4">What happens next?</h3>
          <ol className="space-y-3">
            <li className="flex items-start space-x-3">
              <span className="text-2xl font-bold text-primary">1.</span>
              <span className="text-lg text-neutral-700">
                We'll send you a confirmation via your preferred contact method
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-2xl font-bold text-primary">2.</span>
              <span className="text-lg text-neutral-700">
                You'll receive an estimate within 2 hours (usually faster!)
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-2xl font-bold text-primary">3.</span>
              <span className="text-lg text-neutral-700">
                Accept the estimate and we'll schedule your appointment
              </span>
            </li>
          </ol>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/" className="btn btn-primary">
          Return Home
        </Link>
        <a href="tel:5551234567" className="btn btn-outline">
          📞 Call if Urgent
        </a>
      </div>
    </div>
  );
}
