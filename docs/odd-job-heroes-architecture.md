# Odd Job Heroes: Senior-First Service Platform Architecture

A website architecture designed for trust, simplicity, and speed—built specifically for older customers who need help with everyday jobs.

## Table of Contents
- [Product North Star](#product-north-star)
- [User Types](#user-types)
- [Information Architecture](#information-architecture)
- [Navigation Design](#navigation-design)
- [Core User Flows](#core-user-flows)
- [Booking & Scheduling](#booking--scheduling)
- [Pricing Architecture](#pricing-architecture)
- [Page Architecture](#page-architecture)
- [Accessibility Requirements](#accessibility-requirements)
- [Key Differentiators](#key-differentiators)

---

## Product North Star

### Purpose
A simple, trustworthy website that helps seniors (and their families) book reliable help for everyday jobs—fast.

### Core Promise
**"Small jobs. Big relief."**

Odd Job Heroes handles hauling, home repairs, yard work, and general labor with a personal touch.

### Primary Outcomes
1. **Customer requests a job in under 2 minutes**
2. **Customer can choose By Job or By Hour pricing**
3. **Customer can upload a photo and get an estimate** (signature feature)
4. **Customer can schedule an appointment** (auto-sync capable)

---

## User Types

### A) Senior Customer (Primary)
**Needs:**
- Big buttons, minimal steps, no confusion
- Phone call option and clear pricing
- Reassurance: trustworthy, local, respectful

**Pain Points:**
- Small text and complex forms are frustrating
- Uncertainty about costs creates anxiety
- Wants to speak to a real person when needed

### B) Adult Child / Caregiver (Secondary)
**Needs:**
- Booking on behalf of parents
- Photo upload + quick scheduling
- Text/email confirmation for coordination

**Pain Points:**
- Coordinating parent's schedule remotely
- Ensuring service provider is trustworthy
- Getting transparent pricing without surprises

### C) Admin (You)
**Needs:**
- Manage requests, estimates, schedule, pricing, service area
- Track jobs, status, payments, and repeat customers
- Streamline operations to maximize billable hours

**Pain Points:**
- Context switching between calls, texts, and bookings
- Manual estimate calculations are time-consuming
- Need to balance responsiveness with actual job execution

---

## Information Architecture

### Public Pages

#### Core Pages
1. **Home** - Hero, services overview, CTA
2. **Services** - Detailed service categories
   - Hauling & Moving Help
   - Handyman / Basic Repairs
   - Yard Work
   - General Labor
   - "Not sure? Ask us."
3. **Pricing** - Transparent pricing models
   - By Job (package examples + "Photo Estimate")
   - By Hour (simple rate + minimums)
4. **Book Now** - Main conversion funnel
5. **How It Works** - Process explanation (3 steps)

#### Trust & Information Pages
6. **About** - Personal story, qualifications
7. **Reviews** - Customer testimonials
8. **Service Area** - Geographic coverage map
9. **FAQ** - Common questions
10. **Contact** - Multiple contact options
11. **Accessibility / Senior-Friendly Promise** - Trust page

#### Utility Pages
- Privacy Policy
- Terms of Service
- Cancellation / Reschedule Policy

### Admin (Private)

#### Dashboard & Operations
- **Dashboard** - Today's jobs, new requests, quick actions
- **Requests Inbox** - Filter by status, manage incoming requests
- **Estimate Builder** - Create and send estimates
- **Schedule Calendar** - Day/week view, drag-drop jobs
- **Jobs** - Status pipeline (scheduled → completed)

#### Configuration & Management
- **Customers** - Contact info, history, notes
- **Pricing Config** - Packages, hourly rates, add-ons
- **Service Area & Travel Fees** - Geographic pricing rules
- **Notifications Settings** - SMS/email preferences

---

## Navigation Design (Senior-First)

### Top Nav (Maximum 4 Items)
- **Services**
- **Pricing**
- **Book Now** (primary CTA button - high contrast)
- **Call Us** (sticky, always visible)

**Design Principle:** Less is more. Every additional nav item increases cognitive load.

### Sticky Bottom Bar (Mobile)
- **Call** - Direct phone link
- **Book** - Booking funnel entry
- **Upload Photo** - Quick estimate request
- **Text** (optional) - SMS contact for caregivers

**Why Bottom Bar:** Thumb-friendly for mobile users, especially older users with larger phones.

---

## Core User Flows

### Flow 1: "Book a Job" (Fast Path)

**Goal:** Complete booking in under 2 minutes, maximum 5 screens.

```
Home → Book Now → Choose Service → Pricing Mode → Details → Schedule → Confirm
```

#### Step-by-Step Screens

**Screen 1: What do you need help with?**
- Large service tiles (4-6 options)
- Icons + clear text labels
- "Not sure? Call us" escape hatch

**Screen 2: By Job or By Hour**
- Two large cards explaining each model
- Default recommendation: "By Job" (predictable pricing)
- Clear examples for each

**Screen 3: Job Details**
- Short form (3-5 fields max)
- Optional photo upload
  - "Show us a photo for a better estimate"
  - Drag-and-drop or mobile camera
- Text description field

**Screen 4: Address & Contact**
- Address autocomplete
- Phone number (required)
- Email (optional)
- Preferred contact method

**Screen 5: Scheduling**
- Choose date
- Choose time window (not exact time)
  - "9–11am", "11–1pm", "1–3pm", "3–5pm"
- Urgency options: Today / This Week / Flexible

**Screen 6: Confirmation**
- Summary of request
- "We'll call/text within [X hours]"
- Calendar sync option
- Confirmation sent via SMS/email

**Progress Indicator:** Always show "Step 2 of 5" so users know how far they've come.

---

### Flow 2: "Photo Estimate" (Signature Feature)

**Goal:** Turn "I don't know what this will cost" into "Here's your estimate" fast.

```
Upload Photo → Describe Job → Address → Preferred Time → Submit → "We'll send estimate"
```

#### Process Flow

**Customer Side:**
1. Upload 1-3 photos
2. Brief description (optional)
3. Address
4. Contact info
5. Submit

**What Happens Next (System):**
1. Create Service Request record (status: `new`)
2. Auto-triage job type based on category + keywords
3. Generate estimate suggestion (rules-based at first)
4. Admin reviews and approves/edits
5. Customer receives estimate link via SMS/email
6. Customer accepts estimate → booking confirmed + calendar sync

**Why This Works:**
- Reduces phone tag: "Can you describe it?" → "Just show me"
- Builds trust: transparent pricing before commitment
- Unique differentiator: few competitors offer this

---

### Flow 3: "Older Person Wants a Human"

**Goal:** Never let technology be a barrier.

```
Home → Call Us → Phone conversation → [Operator creates booking]
```

**Messaging on Site:**
> "If forms are annoying, just call. We'll handle it."
>
> **[BIG PHONE NUMBER]**
>
> Monday–Saturday, 8am–6pm

**Admin Workflow:**
1. Answer call
2. Open admin dashboard
3. Create request manually while talking
4. Send confirmation immediately after call

**Design Principle:** The website should never fight users who prefer human contact.

---

## Booking & Scheduling

### Scheduling Options

**Time Windows (Not Exact Times)**
- Customer picks windows: "9–11am", "11–1pm", etc.
- Easier for operations (no traffic/job overrun pressure)
- Admin confirms exact arrival time later if needed

**Why Windows Work:**
- Reduces customer disappointment from delays
- Gives you operational flexibility
- Industry standard for home services

### Calendar Sync

**Admin Integration:**
- Connect Google Calendar (or iCloud via manual feed)
- When job is confirmed:
  1. Create calendar event
  2. Add customer address + notes + contact
  3. Set reminder (day-before + 2-hour)

**Customer Calendar:**
- Optional: customer can add to their calendar
- Provide `.ics` file download in confirmation email

**Rescheduling:**
- Admin can drag-drop in calendar view
- Automatic notification sent to customer
- Customer can request reschedule via link in confirmation

---

## Pricing Architecture

### Pricing Modes

#### 1. By Job (Recommended Default)

**Best For:** Predictable costs, senior customers who dislike surprises

**Package Examples:**
- "Move one appliance" - $[X]
- "Furniture rearrange (1 room)" - $[Y]
- "Haul away up to 5 items" - $[Z]
- "Hang pictures/shelves (up to 3 hours)" - $[W]

**Structure:**
- Base price
- Modifiers (stairs, heavy items, distance)
- Clear inclusions/exclusions

**Messaging:**
> "Know the price before we start. No surprises."

#### 2. By Hour

**Best For:** Undefined scope, longer projects, repeat customers

**Structure:**
- Simple base rate: $[X]/hour
- Minimum hours: [Y] hours
- Travel fee (if outside primary service area)

**Messaging:**
> "Pay only for the time we work. Simple and fair."

### Estimate Strategy (Phased Implementation)

#### Phase 1 (MVP): Rules-Based Estimates

**Formula:**
```
Total = Base Price + Modifiers + Travel Fee + Disposal Fee (if applicable)
```

**Example Modifiers:**
- **Stairs:** +$[X] per floor
- **Heavy item (>50 lbs):** +$[Y] per item
- **Distance >15 miles:** +$[Z]
- **Disposal required:** +$[W] or calculated by volume

**Admin Tool:**
- Checklist-based estimate builder
- Pre-configured rules
- Manual override capability

#### Phase 2: Smart Estimate Calculator

**Enhancements:**
- Photo analysis for item count/size estimation
- Historical job data for accuracy
- Confidence scoring: "High confidence: $X" vs "Range: $X–$Y"

**Not "AI Magic":**
- More like "AI calculator that doesn't lie"
- Always shows reasoning: "Based on: 2 flights of stairs + 3 heavy items"
- Admin always reviews before sending

---

## Page Architecture

### Home Page (Detailed Sections)

#### 1. Hero Section
**Headline:** "Odd Job Heroes — Help for the jobs that pile up."

**Subheadline:** "Reliable help for seniors. Hauling, repairs, yard work, and everything in between."

**CTA Buttons:**
- **Book Now** (primary - high contrast)
- **Upload a Photo** (secondary - unique value prop)
- **Call [XXX-XXX-XXXX]** (tertiary - always visible)

**Visual:** Real photos (not stock), friendly and professional

---

#### 2. Services Tiles (4–6 Max)

Large, clickable tiles with:
- Icon
- Service name
- 1-sentence description
- "Learn more" link

**Example Services:**
- 🚚 Hauling & Moving Help
- 🔨 Handyman / Basic Repairs
- 🌳 Yard Work & Cleanup
- 💪 General Labor
- ❓ "Not sure? Ask us."

---

#### 3. How It Works (3 Steps)

**Keep It Simple:**

**Step 1: Tell Us**
"Call, book online, or upload a photo of the job."

**Step 2: We Quote**
"Get a clear estimate—by the job or by the hour."

**Step 3: We Show Up**
"We'll handle it with care and respect."

**Visual:** Simple illustrations or icons (not cluttered)

---

#### 4. Pricing Preview

Two cards side-by-side:

**By Job**
- "Know the price upfront"
- Example: "Appliance haul-away: $[X]"
- CTA: "See packages"

**By Hour**
- "Pay for time worked"
- "$[X]/hour, [Y] hour minimum"
- CTA: "Learn more"

---

#### 5. Trust Strip

**Single row with icons/text:**
- ✓ Reliable - "Show up on time, every time"
- ✓ Respectful - "We treat your home like ours"
- ✓ Clear Pricing - "No surprises"

---

#### 6. Reviews Section

3–5 customer testimonials with:
- Photo (if permission granted)
- Name + neighborhood
- Star rating
- Quote (2-3 sentences)

**Example:**
> ⭐⭐⭐⭐⭐
> "They moved my couch upstairs and were so patient. I felt safe having them in my home."
> — Margaret S., Riverside

---

#### 7. Service Area

**Map + List:**
- Visual map highlighting service area
- List of cities/neighborhoods
- Note about travel fees for edge areas

---

#### 8. Final CTA

**Big, centered:**
> "Ready to get help with your odd jobs?"
>
> **[BOOK NOW - BIG BUTTON]**
>
> Or call [XXX-XXX-XXXX]

---

### Services Page

**Each service has its own section:**

1. **What We Do**
   - Detailed description
   - Photos/examples

2. **Common Jobs**
   - Bulleted list of typical requests
   - "Move furniture", "Clear garage", etc.

3. **What to Expect**
   - Process explanation
   - Time estimates (rough ranges)

4. **Pricing Guidance**
   - Link to pricing page
   - "Most jobs range from $X–$Y"

5. **CTA**
   - "Book this service"
   - "Upload a photo for estimate"

---

### Pricing Page

**Two Tabs:**
- **By Job** (default)
- **By Hour**

#### By Job Tab
- Table of example jobs with price ranges
- "Exact quote after photo or quick call"
- Link to photo estimate form

**Example Table:**

| Job Type | Price Range |
|----------|-------------|
| Single appliance haul | $[X]–$[Y] |
| Furniture rearrange (1 room) | $[X]–$[Y] |
| Yard cleanup (1-2 hours) | $[X]–$[Y] |
| Basic repairs (up to 3 hours) | $[X]–$[Y] |

#### By Hour Tab
- Hourly rate: $[X]/hour
- Minimum: [Y] hours
- Travel fee structure
- What's included vs. materials costs

**CTA:** "Get started" → booking funnel

---

### Book Now Funnel (Wizard UI)

**Progress Bar:** Always visible at top

**Screen 1:** Service category (big tiles)

**Screen 2:** By Job / By Hour (two cards)

**Screen 3:** Details + photo upload

**Screen 4:** Address + contact preference

**Screen 5:** Schedule window + urgency

**Screen 6:** Confirmation

**Design Principles:**
- One question per screen
- Large buttons (min 48px height)
- Clear "Back" option on every screen
- Auto-save progress (don't lose data)
- Exit option: "Call us instead"

---

## Accessibility & Senior-Friendly Requirements

### Visual Design
- **Font size default:** 18px minimum (20px preferred)
- **High contrast mode toggle** at top of site
- **Buttons:** Minimum 48px height, 16px padding
- **No tiny links** (min 16px text, 44px touch target)
- **Minimal scrolling** in booking funnel (one screen = one question)

### Language & Tone
**Use plain language:**
- ✓ "Upload Photo" (not "Attach media")
- ✓ "Book a time" (not "Schedule service window")
- ✓ "Haul away" (not "Disposal services")
- ✓ "Fix it" (not "Remediate")

**Tone:**
- Warm, respectful, patient
- No jargon or tech-speak
- Short sentences
- Active voice

### Interaction Design
- **No hover-only interactions** (works on touch screens)
- **Large click/tap targets** (minimum 44x44px)
- **Clear focus states** for keyboard navigation
- **No time limits** on forms (don't auto-expire sessions)

### Support Options
- **"Have someone else book for you?"** link (caregiver flow)
- **Always show "Call Us"** as a safe escape hatch
- **Live chat** (optional Phase 2) - human, not bot

### Testing Checklist
- [ ] Works with browser zoom at 200%
- [ ] Readable with high contrast settings
- [ ] Navigable with keyboard only
- [ ] Screen reader compatible (proper ARIA labels)
- [ ] Works on older devices (iPhone 8, Android 9+)

---

## Key Differentiators

### 1. Photo-Based Estimates
**Messaging:** "Show us. We'll quote it."

**Why It Matters:**
- Reduces back-and-forth phone calls
- Provides accurate pricing faster
- Builds trust through transparency
- Unique in the market (most competitors require on-site visits or phone descriptions)

---

### 2. Senior-First Experience
**Messaging:** "Built for ease, not tech show-offs."

**Why It Matters:**
- Target demographic often frustrated by modern websites
- Demonstrates respect and understanding
- Reduces abandonment in booking funnel
- Family members appreciate the thoughtfulness

---

### 3. Versatility
**Messaging:** "One person who can do the annoying things."

**Why It Matters:**
- Seniors don't want to coordinate multiple contractors
- "Odd jobs" = things too small for specialists
- Builds long-term relationship (repeat customers)
- Word-of-mouth gold: "Just call [Name], he does everything"

---

### 4. Personal Touch
**Messaging:** "We treat your home like it's ours."

**Why It Matters:**
- Safety concern is #1 for seniors letting strangers in
- Personal service = competitive moat (hard to replicate)
- Higher prices justified by trust and care
- Reviews highlight this consistently

---

## Success Metrics

### Customer Acquisition
- **Booking conversion rate:** % of visitors who submit request
- **Photo estimate adoption:** % choosing photo vs. call/form
- **Time to first contact:** < 2 hours goal
- **Booking completion time:** < 2 minutes goal

### Operations
- **Estimate acceptance rate:** % of estimates accepted
- **Schedule utilization:** billable hours / available hours
- **Repeat customer rate:** % of customers with 2+ bookings
- **Average job value:** revenue per completed job

### Trust & Quality
- **Review rating average:** 4.8+ stars goal
- **Cancellation rate:** < 5% goal
- **On-time arrival rate:** 95%+ goal
- **Customer satisfaction score:** Post-job survey

---

## What This Demonstrates

### Systems Thinking
- **Customer journey mapping** across three user types
- **Funnel optimization** for senior-friendly conversion
- **Operations integration** (booking → estimate → schedule → completion)
- **Trust architecture** (reviews, policies, accessibility)

### Business Design
- **Pricing strategy** supporting both predictable packages and flexible hourly
- **Differentiation through simplicity** (senior-first as competitive advantage)
- **Photo estimates as signature feature** (operational efficiency + customer value)
- **Scalability considerations** (MVP → V2 roadmap)

### User Experience
- **Accessibility as core requirement** (not afterthought)
- **Multi-modal interaction** (web, phone, text, photo)
- **Escape hatches everywhere** (never trap users in digital flow)
- **Progressive disclosure** (simple first, details when needed)

### Technical Planning
- **Clear information architecture** (11 public pages, admin dashboard)
- **Data model design** (customers, requests, estimates, jobs)
- **Integration requirements** (calendar sync, SMS, email, payments)
- **Phased delivery** (MVP vs. V2 feature sets)

---

This isn't just a website. It's a **trust platform** for a demographic that modern web design often ignores.
