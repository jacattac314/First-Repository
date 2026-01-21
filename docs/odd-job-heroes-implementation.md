# Odd Job Heroes: Implementation Strategy & Tech Stack

Pragmatic technology choices and phased delivery plan to ship fast without technical debt.

## Table of Contents
- [Tech Stack](#tech-stack)
- [MVP Scope](#mvp-scope-launch-worthy)
- [V2 Roadmap](#v2-roadmap-the-oh-damn-version)
- [Implementation Phases](#implementation-phases)
- [Development Priorities](#development-priorities)
- [Deployment & Operations](#deployment--operations)
- [Cost Structure](#cost-structure)

---

## Tech Stack

### Philosophy
**Ship fast. Stay flexible. Avoid over-engineering.**

We're building a business tool, not a tech showcase. Every choice prioritizes:
1. **Speed to market** (weeks, not months)
2. **Operational simplicity** (one person can manage it)
3. **Low ongoing costs** (profitable from job #1)
4. **Easy to change** (no vendor lock-in nightmares)

---

### Frontend

#### Next.js 14 (App Router)
**Why:**
- Server components for fast page loads (critical for older users on slow connections)
- Built-in API routes (no separate backend needed for simple endpoints)
- Static generation for public pages (Services, Pricing, etc.)
- Image optimization out-of-the-box
- SEO-friendly (important for local search)

**Alternatives considered:**
- ❌ Pure React SPA: Worse SEO, slower initial load
- ❌ WordPress: Not flexible enough for custom workflows
- ❌ No-code (Webflow, Wix): Hits limits with custom admin dashboard

---

#### Tailwind CSS
**Why:**
- Fast styling without CSS file bloat
- Responsive design utilities (mobile-first required)
- Easy to make accessibility adjustments (text sizing, contrast)
- No runtime cost (compiled away)

**Senior-friendly overrides:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'base': '18px',  // Larger default
        'lg': '20px',
        'xl': '24px'
      },
      colors: {
        'high-contrast': {
          text: '#000000',
          bg: '#FFFFFF',
          primary: '#0066CC'
        }
      }
    }
  }
}
```

---

#### shadcn/ui
**Why:**
- Accessible components (ARIA-compliant out of the box)
- Copy-paste, not npm install (you own the code)
- Built on Radix UI (solid accessibility foundation)
- Easy to customize for large buttons, high contrast

**Key components we'll use:**
- Form components (Input, Select, Checkbox)
- Dialog/Modal
- Calendar picker
- Toast notifications

---

### Backend & Database

#### Supabase
**Why:**
- PostgreSQL database (real SQL, not NoSQL limitations)
- Built-in authentication
- File storage with signed URLs
- Real-time subscriptions (useful for admin dashboard updates)
- Generous free tier → affordable scaling
- Row-level security (data access control)

**What we get:**
- Database (Postgres 15)
- Storage (S3-compatible)
- Auth (but we'll keep it simple)
- Auto-generated REST API (we'll use selectively)
- Realtime (optional for Phase 2)

**Alternatives considered:**
- ❌ Firebase: Firestore's NoSQL is limiting for relational data (customers → requests → estimates → jobs)
- ❌ AWS (RDS + S3 + Lambda): Too much DevOps overhead
- ❌ Traditional hosting + MySQL: More manual setup, less features

---

#### Database Access

**Prisma ORM**
**Why:**
- Type-safe database queries (catches bugs at compile time)
- Excellent migration system
- Great developer experience
- Works perfectly with Supabase Postgres

```typescript
// Example: Type-safe query
const request = await prisma.serviceRequest.create({
  data: {
    customer: {
      connectOrCreate: {
        where: { phone: customerPhone },
        create: { name, phone, email }
      }
    },
    serviceCategory: 'hauling',
    description: 'Move couch upstairs',
    status: 'new'
  },
  include: {
    customer: true
  }
})
```

---

### Scheduling

#### Phase 1: Calendly Embed (MVP)
**Why:**
- Zero code to get scheduling working
- Professional UI
- Calendar sync built-in (Google, iCal)
- Free for single user

**How it works:**
1. Customer accepts estimate
2. Redirected to Calendly booking page
3. Calendly creates event in your Google Calendar
4. Confirmation sent to customer
5. Webhook back to your app (updates Job record)

**Limitations:**
- Less customization
- Feels slightly "off-brand"
- Can't pre-fill customer info easily

---

#### Phase 2: Custom Scheduling (V2)
**Why:** Full control, better UX integration

**Implementation:**
- Build calendar availability system
- Store available time slots in database
- Sync with Google Calendar API (bidirectional)
- Show availability in-app (no external redirect)

**When to switch:**
- After validating demand (10+ jobs/month)
- When Calendly UX friction is measurable
- Not before (don't over-build)

---

### Payments

#### Stripe
**Why:**
- Industry standard
- Excellent documentation
- No merchant account needed
- Low fees (2.9% + $0.30)
- Invoice feature (for email invoicing)

**Phase 1 (MVP):**
- No online payments (cash/check/Venmo accepted manually)
- Use Stripe for invoicing only (optional)

**Phase 2:**
- Stripe Payment Links (for deposit collection)
- Stripe Checkout (for upfront payment option)

**Why delay payments:**
- Many seniors prefer cash/check
- Adds complexity to MVP
- Payment processing fees eat margin on small jobs
- Focus on booking first, payment automation later

---

### Communication

#### Twilio (SMS)
**Why:**
- Best-in-class SMS API
- Reliable delivery
- Two-way messaging (customers can reply)
- Affordable ($0.0079/SMS)

**Setup:**
- Purchase local phone number
- Send transactional messages (confirmations, reminders)
- Receive replies (webhook to admin dashboard)

---

#### Postmark (Email)
**Why:**
- Transactional email specialist (not marketing)
- High deliverability
- Simple API
- Beautiful default templates
- Free tier: 100 emails/month

**Alternatives:**
- SendGrid: Good, but more complex
- AWS SES: Cheaper at scale, but harder to set up
- Mailgun: Good alternative

---

### Photo Uploads

#### Supabase Storage
**Why:**
- Already using Supabase
- S3-compatible (easy migration if needed)
- Built-in image transformations
- Signed URLs for security

**Flow:**
1. Frontend uploads to Supabase Storage (direct from browser)
2. Supabase returns file URL
3. Backend creates Service Request with photo URLs
4. Admin views photos via signed URLs (auto-expire)

**Optimization:**
- Automatic image resizing (max 2000px width)
- Thumbnail generation (400px width)
- WebP conversion for smaller file sizes

---

### Calendar Integration

#### Google Calendar API
**Why:**
- Most common calendar for small businesses
- Free API access
- Good documentation
- Two-way sync possible

**Implementation:**
1. OAuth setup (one-time admin authorization)
2. When job scheduled: Create Google Calendar event
3. Store `event_id` in Job record
4. Updates/cancellations: Update Google Calendar via API

**Phase 2: Customer calendar**
- Generate `.ics` files (iCalendar format)
- Works with Google, Apple, Outlook
- No API needed (just downloadable file)

---

### Admin Dashboard

#### Next.js App Router (Same Codebase)
**Why:**
- Shared components with public site
- One deployment
- Easy to add `/admin/*` routes with middleware protection

**Structure:**
```
/app
  /(public)
    /page.tsx              → Home
    /services/page.tsx     → Services
    /pricing/page.tsx      → Pricing
    /book/page.tsx         → Booking funnel
  /(admin)
    /admin/page.tsx        → Dashboard
    /admin/requests/       → Requests inbox
    /admin/estimates/      → Estimate builder
    /admin/schedule/       → Calendar
    /admin/jobs/           → Jobs pipeline
    /admin/customers/      → Customer list
```

**Authentication:**
- Simple password auth (Supabase Auth)
- Middleware checks for admin session
- Redirect to `/login` if not authenticated

---

### Analytics (Optional)

#### Plausible Analytics
**Why:**
- Privacy-friendly (no cookies, GDPR-compliant)
- Simple metrics (page views, conversions)
- No impact on page speed
- Affordable ($9/month)

**What to track:**
- Booking funnel drop-off points
- Photo estimate vs. regular booking ratio
- Most visited service pages
- Time on site (by age demographic if trackable)

**Alternatives:**
- Google Analytics 4: Free, but privacy concerns
- No analytics: Also valid for MVP

---

## MVP Scope (Launch-Worthy)

**Goal:** Ship in 4–6 weeks. Validate demand. Start booking jobs.

### Public Website (Must-Have)

✅ **Home Page**
- Hero + CTA
- Services overview
- How it works
- Pricing preview
- Reviews section
- Service area

✅ **Services Page**
- 4 service categories (Hauling, Handyman, Yard Work, General Labor)
- Descriptions + examples
- CTAs to booking

✅ **Pricing Page**
- By Job examples
- By Hour rate
- Clear terms
- Link to photo estimate

✅ **Book Now Funnel**
- 5-step wizard (Service → Mode → Details → Schedule → Confirm)
- Form validation
- Photo upload (optional)
- Mobile-responsive

✅ **How It Works**
- 3-step process explanation

✅ **FAQ**
- 8–10 common questions

✅ **Contact**
- Phone, email, SMS
- Contact form (backup option)

✅ **Utility Pages**
- Privacy Policy
- Terms of Service
- Cancellation Policy

---

### Admin Dashboard (Must-Have)

✅ **Dashboard Home**
- Today's jobs
- New requests needing estimates
- Quick actions

✅ **Requests Inbox**
- List view (filterable by status)
- Detail view (photos, customer info)
- Status update buttons

✅ **Estimate Builder**
- By Job / By Hour toggle
- Line item builder
- Modifiers checklist
- Preview + Send

✅ **Schedule Calendar**
- Week view
- Manual job entry
- Status indicators

✅ **Jobs List**
- Status pipeline
- Mark completed
- Payment tracking (manual)

✅ **Customers List**
- Search by name/phone
- Booking history
- Notes field

---

### Backend Features (Must-Have)

✅ **Database Schema**
- Customers, Addresses, Service Requests, Estimates, Jobs, Reviews
- Pricing config tables

✅ **Notifications**
- SMS: Booking confirmation, estimate sent, appointment reminder
- Email: Estimate details, job confirmation

✅ **Photo Upload**
- Direct to Supabase Storage
- Image optimization

✅ **Estimate Link Generation**
- Short-lived tokens
- Accept/decline actions

---

### What's NOT in MVP

❌ **Customer portal** (just estimate accept link)
❌ **Online payments** (cash/check/Venmo manually tracked)
❌ **Review system** (collect reviews, but publish manually)
❌ **Advanced calendar** (use Calendly or manual for now)
❌ **Automated estimate suggestions** (admin builds estimates manually)
❌ **SMS two-way conversations** (receive replies, but manual response)
❌ **Mobile app** (responsive web only)

---

## V2 Roadmap (The "Oh Damn" Version)

**Goal:** Automate what's manual. Optimize what's working. Scale what's proven.

**When to start V2:** After 20+ completed jobs and consistent demand.

---

### V2.1: Customer Experience (Month 3–4)

🎯 **Customer Portal**
- Login via magic link (email-based, no password)
- View past jobs
- Re-book previous services (one click)
- Update contact info

🎯 **Advanced Scheduling**
- Real-time availability display
- Auto-suggest optimal times (based on existing jobs)
- Calendar sync for customers

🎯 **Review System**
- Post-job review prompts (automated)
- Review moderation dashboard
- Featured reviews on homepage

🎯 **Referral Program**
- "Refer a friend" link
- Track referrals
- Discount code generation

---

### V2.2: Operational Automation (Month 4–5)

🎯 **Smart Estimate Suggestions**
- Rules engine: "If category = hauling + stairs > 1 + heavy items > 2 → Base $150 + $25 + $30"
- Photo analysis (basic): Item count estimation, volume estimation
- Historical job data: "Similar jobs averaged $X"
- Confidence scoring: "High confidence: $175" vs "Range: $150–$200"

**Why this works:**
- Admin still reviews (not fully automated)
- Reduces estimate time from 10 min → 2 min
- Consistency across similar jobs

---

🎯 **Automated Schedule Optimization**
- Suggest job sequences (minimize driving)
- Auto-block travel time buffers
- Flag scheduling conflicts

---

🎯 **Payment Deposit System**
- Optional: Collect 25% deposit on large jobs (>$300)
- Stripe Payment Links (simple, no custom checkout UI)
- Auto-update job status when paid

---

### V2.3: Business Intelligence (Month 5–6)

🎯 **Reporting Dashboard**
- Revenue by service category
- Average job value trends
- Customer acquisition cost (if running ads)
- Repeat customer rate
- Seasonal demand patterns

🎯 **CRM Features**
- Customer lifetime value calculation
- Automatic follow-up reminders ("Check in with Margaret in 3 months about yard cleanup")
- VIP customer tagging

🎯 **Pricing Optimization**
- Track estimate acceptance rate by price point
- Identify underpriced jobs (actual time > estimated)
- Suggest price adjustments

---

### V2.4: Scale Features (Month 6+)

🎯 **Multi-Person Crew**
- Add crew members to system
- Assign jobs to specific people
- Track individual performance

🎯 **Route Optimization**
- Daily route planning (Google Maps API)
- Minimize drive time between jobs

🎯 **Subscription Services**
- Monthly yard maintenance plans
- Recurring jobs (e.g., "First Monday of every month")

🎯 **Marketing Automation**
- Seasonal service promotions (spring yard cleanup)
- Win-back campaigns (customers who haven't booked in 6+ months)
- Birthday/holiday messages (builds relationships)

---

## Implementation Phases

### Phase 0: Foundation (Week 1)
**Goal:** Set up development environment and core infrastructure.

**Tasks:**
- [ ] Create Next.js project
- [ ] Set up Tailwind + shadcn/ui
- [ ] Create Supabase project
- [ ] Design database schema (Prisma)
- [ ] Run initial migrations
- [ ] Set up Git repo + deployment (Vercel)
- [ ] Configure environment variables

**Deliverable:** App deployed to staging URL (empty shell)

---

### Phase 1: Public Website (Weeks 2–3)
**Goal:** Marketing site that drives bookings.

**Week 2:**
- [ ] Home page (all sections)
- [ ] Services page (4 categories)
- [ ] Pricing page
- [ ] How It Works page
- [ ] Responsive design (mobile-first)

**Week 3:**
- [ ] Booking funnel (5 steps)
- [ ] Photo upload functionality
- [ ] Form submission → Database
- [ ] Confirmation page
- [ ] FAQ + Contact pages
- [ ] Footer (Privacy, Terms)

**Deliverable:** Functional public website (can accept bookings)

---

### Phase 2: Notifications (Week 3)
**Goal:** Automated customer communication.

**Tasks:**
- [ ] Twilio account setup
- [ ] Postmark account setup
- [ ] SMS templates (confirmation, reminder)
- [ ] Email templates (confirmation, estimate)
- [ ] Webhook handlers (delivery status tracking)
- [ ] Test all notification flows

**Deliverable:** Customers receive confirmations automatically

---

### Phase 3: Admin Dashboard (Week 4)
**Goal:** Operational command center.

**Tasks:**
- [ ] Admin authentication
- [ ] Dashboard home (today's jobs, new requests)
- [ ] Requests inbox (list + detail view)
- [ ] Customer list
- [ ] Basic job tracking

**Deliverable:** Admin can view and manage incoming requests

---

### Phase 4: Estimate System (Week 5)
**Goal:** Fast, accurate estimates.

**Tasks:**
- [ ] Pricing config tables (seed data)
- [ ] Estimate builder UI
- [ ] Line item calculator
- [ ] Preview generation
- [ ] Send estimate (SMS + email)
- [ ] Estimate acceptance page (public)
- [ ] Accept/decline actions

**Deliverable:** End-to-end estimate workflow (request → estimate → acceptance)

---

### Phase 5: Scheduling & Jobs (Week 6)
**Goal:** Job execution tracking.

**Tasks:**
- [ ] Calendar view (week)
- [ ] Manual job creation
- [ ] Calendly integration OR custom availability slots
- [ ] Job status pipeline
- [ ] Google Calendar sync
- [ ] Appointment reminders (automated)

**Deliverable:** Jobs scheduled and tracked through completion

---

### Phase 6: Polish & Launch (Week 7)
**Goal:** Production-ready.

**Tasks:**
- [ ] Accessibility audit (WAVE, axe DevTools)
- [ ] Mobile testing (real devices)
- [ ] Load testing (basic)
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Error monitoring (Sentry)
- [ ] Final design polish
- [ ] User acceptance testing (seniors)

**Deliverable:** 🚀 **Launch**

---

## Development Priorities

### Priority 1: Senior-Friendly UX
**Non-negotiable.**

Every decision filters through: "Can an 75-year-old with reading glasses use this on an iPhone 8?"

**Examples:**
- Button size > aesthetic preference
- Plain language > marketing copy
- Phone number visibility > clever navigation

**Testing:**
- User test with actual seniors (3–5 people)
- Use accessibility tools (screen reader, high contrast mode)
- Test on older devices (not just latest iPhone/MacBook)

---

### Priority 2: Photo Estimate Workflow
**Signature feature. Must work flawlessly.**

This is your competitive differentiator. If photo upload is clunky, you've lost.

**Success criteria:**
- Upload works on all mobile browsers (iOS Safari, Android Chrome)
- Images compressed automatically (don't eat user's data plan)
- Preview shown immediately after upload
- Works even on slow 3G connections

**Testing:**
- Test on real mobile devices (not just browser DevTools)
- Test with poor network (Chrome DevTools throttling)
- Test image orientation (EXIF data handling)

---

### Priority 3: Speed
**Every second counts.**

Target: Pages load in <2 seconds on 3G.

**Tactics:**
- Next.js image optimization
- Static generation for public pages
- Minimal JavaScript (only what's needed)
- Lazy load below-the-fold content
- CDN for static assets (Vercel handles this)

**Monitoring:**
- Lighthouse CI in GitHub Actions
- Core Web Vitals tracking (Plausible)
- Real User Monitoring (optional: SpeedCurve)

---

### Priority 4: Reliability
**Nothing is worse than a broken booking form.**

**Zero tolerance for:**
- 500 errors on booking submission
- Lost form data (auto-save progress)
- Photos failing to upload without clear error message

**How:**
- Error boundaries (React error handling)
- Retry logic on network failures
- Form state persistence (localStorage)
- Error monitoring (Sentry)
- Uptime monitoring (UptimeRobot - free)

---

## Deployment & Operations

### Hosting

#### Vercel (Recommended)
**Why:**
- Next.js creators (best-in-class support)
- Zero-config deployment (git push → live)
- Automatic HTTPS
- Global CDN
- Preview deployments (every PR)
- Free tier generous enough for MVP

**Pricing:**
- Free: Hobby plan (fine for MVP)
- $20/month: Pro (when scaling)

---

#### Railway (Alternative)
**Why:**
- Simple, modern platform
- Good for full-stack apps
- Fair pricing

**When to consider:**
- If you want full control over backend
- If Next.js API routes aren't enough

---

### Database

#### Supabase (Recommended)
**Pricing:**
- Free: 500MB database, 1GB storage, 2GB bandwidth
- $25/month: Pro (when scaling)

**When to upgrade:**
- >500MB data (after ~500 jobs with photos)
- Need more storage (thousands of photos)
- Want daily backups (Pro feature)

---

### Monitoring

#### Sentry (Error Tracking)
**Why:**
- Catch errors before customers report them
- Stack traces + user context
- Free tier: 5K errors/month

**What to track:**
- All server errors
- Failed API calls
- JavaScript errors (frontend)

---

#### Uptime Robot (Uptime Monitoring)
**Why:**
- Free tier: 50 monitors
- Checks every 5 minutes
- Email/SMS alerts

**What to monitor:**
- Homepage (https://oddjobheroes.com)
- Booking funnel (https://oddjobheroes.com/book)
- Admin dashboard (https://oddjobheroes.com/admin)

---

### Backups

#### Database
- Supabase Pro: Daily automated backups
- Free tier: Manual exports (weekly)
  - `pg_dump` via Supabase dashboard
  - Store in Google Drive or Dropbox

#### Photos
- Supabase storage is redundant (S3-backed)
- Optional: Sync to Google Drive (Zapier or custom script)

---

### Domain & Email

#### Domain
- Namecheap, Google Domains, Cloudflare Registrar
- Budget: $12/year

#### Email
- Google Workspace: $6/user/month (professional)
- OR Zoho Mail: $1/user/month (budget option)
- OR Email forwarding only (free, via Cloudflare)

**Recommendation:** Google Workspace
- `[email protected]` looks more professional than Gmail
- Customer trust signal
- Gets you Google Calendar (needed for integration)

---

## Cost Structure

### MVP (First 6 Months)

#### One-Time
| Item | Cost |
|------|------|
| Domain name | $12/year |
| Development (self) | $0 (your time) |
| **Total** | **$12** |

#### Monthly (Estimate)
| Item | Cost |
|------|------|
| Vercel Hobby | $0 |
| Supabase Free | $0 |
| Google Workspace | $6 |
| Twilio (50 SMS/mo) | $0.40 |
| Postmark (100 emails/mo) | $0 |
| **Total** | **~$6.40/month** |

#### Variable Costs (Per Job)
| Item | Cost |
|------|------|
| SMS (4 per job: confirm, estimate, 2 reminders) | $0.03 |
| Emails (3 per job) | $0 (free tier) |
| **Total per job** | **~$0.03** |

**Break-even:** First paying job.

---

### Scaling (After 50 Jobs/Month)

#### Monthly (Estimate)
| Item | Cost |
|------|------|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| Google Workspace | $6 |
| Twilio (200 SMS/mo) | $1.60 |
| Postmark (500 emails/mo) | $10 |
| Plausible Analytics | $9 |
| **Total** | **~$71.60/month** |

#### Revenue Required
- 50 jobs/month × $150 avg = $7,500/month revenue
- Platform costs: $72 (~1% of revenue)
- **Extremely profitable.**

---

## What This Demonstrates

### Technical Pragmatism
- **Right-sized stack** for a solo operator
- **Proven technologies** (not bleeding-edge experiments)
- **Cost-conscious** (profitable from day one)
- **Ship fast, iterate** (MVP → V2 → V3)

### Phased Delivery
- **Week 1:** Foundation
- **Weeks 2–3:** Public site
- **Weeks 4–6:** Admin tools
- **Week 7:** Launch

**Not:** "Build everything, launch in 6 months (and burn out)."

### Business-First Thinking
- **Validate demand** before building V2 features
- **Manual processes OK** in MVP (automate what's proven)
- **Cost structure** supports bootstrapping (no VC required)

### Scalability Without Premature Optimization
- **Start simple** (Calendly, manual estimates)
- **Scale components** as they become bottlenecks
- **Data model ready** for V2 features (but don't build them yet)

---

This isn't a tech demo. It's a **blueprint to ship a real business in 6 weeks** that makes money on job #1.
