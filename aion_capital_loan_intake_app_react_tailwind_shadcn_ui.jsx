import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// ────────────────────────────────────────────────────────────────────────────────
// THEME & CONTACTS
const AION_GREEN = "#39ff14";
const CONTACT_EMAIL = "aioncapitalfl@gmail.com";
const CONTACT_PHONE = "321-607-0070";
// Optional endpoint (Formspree/Basin/custom API). If empty, we fall back to mailto.
const SUBMIT_ENDPOINT = ""; // e.g., "https://formspree.io/f/xxxxxx"

// ────────────────────────────────────────────────────────────────────────────────
// STEPS
const steps = [
  { key: "type", label: "Loan Type" },
  { key: "contact", label: "Contact" },
  { key: "business", label: "Business" },
  { key: "loan", label: "Loan Details" },
  { key: "review", label: "Review & Send" },
] as const;

// ────────────────────────────────────────────────────────────────────────────────
// HELPERS
const nf = new Intl.NumberFormat("en-US");
const formatCurrency = (raw: string) => {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return nf.format(parseInt(digits, 10));
};
const formatPhone = (raw: string) => {
  const d = raw.replace(/[^0-9]/g, "");
  const area = d.slice(-10, -7);
  const mid = d.slice(-7, -4);
  const last = d.slice(-4);
  return [area && `(${area})`, mid, last].filter(Boolean).join(" ");
};

// ────────────────────────────────────────────────────────────────────────────────
// APP
export default function App() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [form, setForm] = useState({
    loanKind: "",
    amountDesired: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    monthlyRevenue: "",
    industry: "",
    creditScoreRange: "",
    useOfFunds: "",
  });

  const validations = useMemo(
    () => ({
      0: () => !!form.loanKind,
      1: () => !!form.firstName && !!form.lastName && /.+@.+\..+/.test(form.email),
      2: () => !!form.businessName,
      3: () => !!form.amountDesired && !!form.creditScoreRange,
      4: () => consentAgreed, // require consent on final step
    }),
    [form, consentAgreed]
  );

  const canNext = validations[step as 0 | 1 | 2 | 3 | 4]();
  const next = () => step < steps.length - 1 && canNext && setStep(step + 1);
  const back = () => step > 0 && setStep(step - 1);
  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!consentAgreed) {
      alert("Please agree to the Privacy & Terms before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        loanKind: form.loanKind,
        amountDesired: form.amountDesired.replace(/[^0-9]/g, ""),
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        businessName: form.businessName,
        monthlyRevenue: form.monthlyRevenue.replace(/[^0-9]/g, ""),
        industry: form.industry,
        creditScoreRange: form.creditScoreRange,
        useOfFunds: form.useOfFunds,
        consent: consentAgreed,
      };

      if (SUBMIT_ENDPOINT) {
        await fetch(SUBMIT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Fallback: open mail draft prefilled
        const subject = encodeURIComponent("New AION Capital Application");
        const body = encodeURIComponent(JSON.stringify(payload, null, 2));
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      }

      alert("Application sent! AION Capital will contact you shortly.");
    } catch (e) {
      console.error(e);
      alert("Could not send the application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70 animate-slow-pan"
        style={{ backgroundImage: "url('/mnt/data/b.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black" />

      {/* Header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center">
        <h1
          className="text-5xl font-semibold uppercase tracking-tight"
          style={{ color: AION_GREEN, textShadow: `0 0 20px ${AION_GREEN}`, fontFamily: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}
        >
          AION CAPITAL
        </h1>
      </div>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-32">
        <h2 className="text-2xl font-bold text-center" style={{ color: AION_GREEN }}>
          Commercial & Residential Loans
        </h2>
        <p className="text-center text-neutral-300 mb-8">Submit your loan request quickly and securely.</p>

        {/* Progress */}
        <ProgressSteps current={step} onJump={setStep} />

        {/* Card */}
        <Card className="mt-6 border border-green-500/40 bg-neutral-900/80 text-white backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold" style={{ color: AION_GREEN }}>
              {steps[step].label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 0 && <StepType form={form} update={update} />}
            {step === 1 && <StepContact form={form} update={update} />}
            {step === 2 && <StepBusiness form={form} update={update} />}
            {step === 3 && <StepLoan form={form} update={update} />}
            {step === 4 && (
              <StepReview
                form={form}
                consentAgreed={consentAgreed}
                setConsentAgreed={setConsentAgreed}
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between" role="group" aria-label="Navigation buttons">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              Back
            </Button>
            {step === steps.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitting || !consentAgreed} className="neon-button w-full sm:w-auto">
                {isSubmitting ? "Sending…" : "Send Application"}
              </Button>
            ) : (
              <Button onClick={next} disabled={!canNext} className={`neon-button ${!canNext ? "opacity-50" : ""}`}>
                Continue
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Contact */}
        <div className="mt-10 text-center">
          <p>
            Email: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <p>
            Phone: <a className="underline" href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, "")}`}>{CONTACT_PHONE}</a>
          </p>
        </div>

        {/* Quick CTA */}
        <div className="mt-8 flex flex-col items-center space-y-3">
          <Button className="neon-button w-full sm:w-auto" onClick={() => (window.location.href = `mailto:${CONTACT_EMAIL}`)}>
            Email Us
          </Button>
          <Button className="neon-button w-full sm:w-auto" onClick={() => (window.location.href = `tel:${CONTACT_PHONE.replace(/[^0-9+]/g, "")}`)}>
            Call Us
          </Button>
        </div>
      </main>

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap');
        @keyframes slow-pan { from { background-position: 0% 0%; } to { background-position: 100% 100%; } }
        .animate-slow-pan { animation: slow-pan 90s linear infinite alternate; }
        .neon-button { background-color: ${AION_GREEN}; color: black; box-shadow: 0 0 15px ${AION_GREEN}; transition: all .3s ease; }
        .neon-button:hover { box-shadow: 0 0 25px ${AION_GREEN}, 0 0 40px ${AION_GREEN}; transform: scale(1.05); }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
function ProgressSteps({ current, onJump }: { current: number; onJump: (i: number) => void }) {
  return (
    <ol className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
      {steps.map((s, i) => (
        <li key={s.key}>
          <button
            type="button"
            onClick={() => onJump(i)}
            className={`w-full py-2 px-3 rounded-xl border transition ${
              i === current
                ? "border-green-400 bg-green-500/10 text-white"
                : i < current
                ? "border-green-500/60 text-green-300"
                : "border-neutral-700 text-neutral-400"
            }`}
            style={{ borderColor: i <= current ? AION_GREEN : undefined }}
            aria-current={i === current ? "step" : undefined}
          >
            {s.label}
          </button>
        </li>
      ))}
    </ol>
  );
}

function StepType({ form, update }: any) {
  return (
    <div className="space-y-4">
      <Label>Loan Type</Label>
      <Select value={form.loanKind} onValueChange={(v) => update("loanKind", v)}>
        <SelectTrigger className="bg-neutral-800 text-white border border-neutral-600">
          <SelectValue placeholder="Select loan type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="line-of-credit">Line of Credit</SelectItem>
          <SelectItem value="working-capital">Working Capital</SelectItem>
          <SelectItem value="equipment">Equipment Financing</SelectItem>
          <SelectItem value="mortgage">Mortgage</SelectItem>
        </SelectContent>
      </Select>
      <Label>Amount Desired (USD)</Label>
      <Input
        inputMode="numeric"
        pattern="[0-9,]*"
        className="bg-neutral-800 text-white border border-neutral-600"
        value={form.amountDesired}
        onChange={(e) => update("amountDesired", formatCurrency(e.target.value))}
        placeholder="50,000"
      />
    </div>
  );
}

function StepContact({ form, update }: any) {
  return (
    <div className="space-y-4">
      <Label>First Name</Label>
      <Input
        autoComplete="given-name"
        className="bg-neutral-800 text-white border border-neutral-600"
        value={form.firstName}
        onChange={(e) => update("firstName", e.target.value)}
      />
      <Label>Last Name</Label>
      <Input
        autoComplete="family-name"
        className="bg-neutral-800 text-white border border-neutral-600"
        value={form.lastName}
        onChange={(e) => update("lastName", e.target.value)}
      />
      <Label>Email</Label>
      <Input
        type="email"
        autoComplete="email"
        className="bg-neutral-800 text-white border border-neutral-600"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
      />
      <Label>Phone</Label>
      <Input
        type="tel"
        autoComplete="tel"
        className="bg-neutral-800 text-white border border-neutral-600"
        value={form.phone}
        onChange={(e) => update("phone", formatPhone(e.target.value))}
        placeholder="(321) 607 0070"
      />
    </div>
  );
}

function StepBusiness({ form, update }: any) {
  return (
    <div className="space-y-4">
      <Label>Business Name</Label>
      <Input
        autoComplete="organization"
        className="bg-neutral-800 text-white border border-neutral-600"
        value={form.businessName}
        onChange={(e) => update("businessName", e.target.value)}
      />
      <Label>Monthly Revenue (USD)</Label>
      <Input
        className="bg-neutral-800 text-white border border-neutral-600"
        value={form.monthlyRevenue}
        onChange={(e) => update("monthlyRevenue", formatCurrency(e.target.value))}
        placeholder="120,000"
      />
      <Label>Industry</Label>
      <Input
        className="bg-neutral-800 text-white border border-neutral-600"
        value={form.industry}
        onChange={(e) => update("industry", e.target.value)}
      />
    </div>
  );
}

function StepLoan({ form, update }: any) {
  return (
    <div className="space-y-4">
      <Label>Approximate Credit Score</Label>
      <Input
        className="bg-neutral-800 text-white border border-neutral-600"
        value={form.creditScoreRange}
        onChange={(e) => update("creditScoreRange", e.target.value)}
        placeholder="Example: 720"
      />
      <Label>Use of Funds</Label>
      <Textarea
        className="bg-neutral-800 text-white border border-neutral-600"
        value={form.useOfFunds}
        onChange={(e) => update("useOfFunds", e.target.value)}
        placeholder="Equipment, payroll, etc."
      />
    </div>
  );
}

function StepReview({ form, consentAgreed, setConsentAgreed }: any) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p>
          <b>Loan Type:</b> {form.loanKind}
        </p>
        <p>
          <b>Amount:</b> {form.amountDesired}
        </p>
        <p>
          <b>Name:</b> {form.firstName} {form.lastName}
        </p>
        <p>
          <b>Email:</b> {form.email}
        </p>
        <p>
          <b>Phone:</b> {form.phone}
        </p>
        <p>
          <b>Business:</b> {form.businessName}
        </p>
        <p>
          <b>Revenue:</b> {form.monthlyRevenue}
        </p>
        <p>
          <b>Credit Score:</b> {form.creditScoreRange}
        </p>
        <p>
          <b>Use of Funds:</b> {form.useOfFunds}
        </p>
      </div>
      <hr className="border-neutral-700" />
      <div className="text-sm text-neutral-300 leading-relaxed">
        By submitting, you agree that AION Capital may contact you about your request and share your application with potential lenders for the purpose of financing review. Your data will be handled in accordance with our privacy practices. For questions, email <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or call <a className="underline" href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, "")}`}>{CONTACT_PHONE}</a>.
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!consentAgreed}
          onChange={(e) => setConsentAgreed(e.target.checked)}
          className="h-4 w-4 accent-green-500"
        />
        <span>I agree to the Privacy & Terms.</span>
      </label>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// DEV TESTS (lightweight assertions; do not remove)
if (typeof window !== "undefined") {
  console.assert(typeof ProgressSteps === "function", "ProgressSteps must be defined");
  console.assert(typeof StepType === "function", "StepType must be defined");
  console.assert(typeof StepContact === "function", "StepContact must be defined");
  console.assert(typeof StepBusiness === "function", "StepBusiness must be defined");
  console.assert(typeof StepLoan === "function", "StepLoan must be defined");
  console.assert(typeof StepReview === "function", "StepReview must be defined");

  // Step count test
  console.assert(Array.isArray(steps) && steps.length === 5, "There should be exactly 5 steps");

  // Validation edge-cases
  const invalidEmail = "nope";
  console.assert(/.+@.+\..+/.test(invalidEmail) === false, "Email regex should fail for invalid email");

  // Phone formatter test
  console.assert(formatPhone("3216070070").startsWith("(321)"), "Phone should format to (321) …");

  // Currency formatter tests
  console.assert(formatCurrency("50000") === "50,000", "Currency formatter should add commas");
  console.assert(formatCurrency("abc") === "", "Currency formatter should return empty for non-digits");
}
