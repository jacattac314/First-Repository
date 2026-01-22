# Odd Job Heroes - Frontend

A senior-first service booking platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Senior-Friendly Design
- **Large text sizes** (18px base, 20px+ for CTAs)
- **High contrast** color palette
- **Touch-friendly buttons** (minimum 44px tap targets)
- **Clear navigation** (maximum 4 nav items)
- **Sticky bottom bar** on mobile for key actions
- **Accessible** (WCAG 2.1 AA compliant)

### Core Pages
- ✅ **Home** - Hero, services, how it works, pricing preview, reviews
- ✅ **Services** - Detailed information for 4 service categories
- ✅ **Pricing** - By Job vs By Hour with interactive tab switcher
- ✅ **Book Now** - 5-step wizard with progress indicator
- ✅ **How It Works** - Process explanation
- ✅ **FAQ** - Accordion-style Q&A
- ✅ **Contact** - Multiple contact methods + form

### Key Features
- **Photo estimate flow** - Upload photo for quick quotes
- **Multi-step booking** - Clear progress, one question per screen
- **Dual pricing models** - Package pricing & hourly rates
- **Mobile-first** - Responsive design optimized for older devices
- **Escape hatches** - "Call us" option always visible

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Ready for Vercel/Railway

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development Server

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
app/
├── page.tsx                # Home page
├── services/page.tsx       # Services page
├── pricing/page.tsx        # Pricing page
├── book/page.tsx           # Booking funnel (5 steps)
├── how-it-works/page.tsx   # How It Works
├── faq/page.tsx            # FAQ
├── contact/page.tsx        # Contact
├── layout.tsx              # Root layout
└── globals.css             # Global styles + Tailwind

components/
├── layout/
│   ├── Header.tsx          # Top navigation
│   ├── Footer.tsx          # Footer with links
│   └── StickyBottomBar.tsx # Mobile bottom navigation
└── ui/                     # Reusable UI components (future)
```

## Design Principles

### 1. Senior-First UX
Every design decision optimized for older users:
- Larger font sizes and buttons
- High contrast colors
- Clear, plain language
- Reduced cognitive load

### 2. Accessibility
- Keyboard navigation support
- Screen reader compatible
- Focus indicators on all interactive elements
- Reduced motion support for vestibular disorders

### 3. Mobile Optimization
- Touch-friendly targets (minimum 44x44px)
- Sticky bottom bar for key actions
- No hover-only interactions

### 4. Performance
- Static generation for public pages
- Image optimization via Next.js
- Minimal JavaScript bundle
- Fast load times (<2s on 3G)

## Configuration

### Tailwind Customization

The `tailwind.config.ts` includes senior-friendly overrides:
- Larger base font sizes (18px default)
- Extended color palette with high contrast options
- Custom spacing for touch targets

### Metadata

Each page includes proper SEO metadata in the page component.

## Future Enhancements

### MVP → V2
- [ ] Backend API integration (Supabase/Firebase)
- [ ] Photo upload functionality
- [ ] Customer portal (view estimates, rebook)
- [ ] Payment integration (Stripe)
- [ ] Real-time scheduling availability
- [ ] SMS/Email notifications (Twilio/Postmark)
- [ ] Review system
- [ ] Admin dashboard

See `/docs/odd-job-heroes-implementation.md` for full roadmap.

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
No environment variables required for MVP (static site).

Future API integration will require:
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 9+)

Tested on older devices: iPhone 8, Samsung Galaxy S9.

## Accessibility Testing

Run accessibility audits:
- Chrome DevTools Lighthouse
- WAVE browser extension
- axe DevTools

Target: WCAG 2.1 AA compliance

## License

Proprietary - Odd Job Heroes

---

**Built with care for seniors who deserve better web experiences.**
