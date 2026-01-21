# Odd Job Heroes: Data Model & Technical Specifications

Technical architecture for the database schema, admin workflows, notifications, and security model.

## Table of Contents
- [Data Model](#data-model)
- [Admin Dashboard Architecture](#admin-dashboard-architecture)
- [Notifications Architecture](#notifications-architecture)
- [Security & Trust](#security--trust)
- [API Endpoints](#api-endpoints)
- [Storage & Media](#storage--media)

---

## Data Model

### Core Entities

#### Customer

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  preferred_contact_method VARCHAR(20) DEFAULT 'phone', -- 'phone', 'sms', 'email'

  -- Customer metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_booking_at TIMESTAMP,
  total_bookings INTEGER DEFAULT 0,

  -- Customer preferences and notes
  notes TEXT, -- "Gate code: 1234", "Uses walker - needs time", etc.
  accessibility_needs TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'archived'

  -- Indexes
  CONSTRAINT phone_format CHECK (phone ~ '^\+?[1-9]\d{1,14}$')
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
```

#### Customer Addresses (Separate table for multiple addresses)

```sql
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Address components
  label VARCHAR(100), -- "Home", "Mom's house", etc.
  street_address VARCHAR(255) NOT NULL,
  unit VARCHAR(50), -- Apartment, suite, etc.
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,

  -- Geocoding (for service area validation and routing)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Address metadata
  access_notes TEXT, -- "Side entrance", "Parking on street", etc.
  is_primary BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX idx_addresses_location ON customer_addresses(latitude, longitude);
```

---

#### Service Request

```sql
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Service details
  service_category VARCHAR(100) NOT NULL, -- 'hauling', 'handyman', 'yard_work', 'general_labor'
  description TEXT NOT NULL,

  -- Photos
  photos JSONB, -- Array of {url, filename, uploaded_at, thumbnail_url}

  -- Location
  address_id UUID REFERENCES customer_addresses(id),

  -- Scheduling preferences
  requested_time_windows JSONB, -- [{date: '2026-01-25', window: '9-11am'}, ...]
  urgency VARCHAR(20) DEFAULT 'flexible', -- 'today', 'this_week', 'flexible'

  -- Status pipeline
  status VARCHAR(50) DEFAULT 'new',
  -- 'new' → 'reviewing' → 'estimate_sent' → 'accepted' → 'scheduled' → 'completed' → 'closed'

  -- Metadata
  source VARCHAR(50), -- 'web_booking', 'photo_estimate', 'phone', 'repeat_customer'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Admin notes
  admin_notes TEXT
);

CREATE INDEX idx_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_requests_status ON service_requests(status);
CREATE INDEX idx_requests_category ON service_requests(service_category);
CREATE INDEX idx_requests_urgency ON service_requests(urgency);
CREATE INDEX idx_requests_created ON service_requests(created_at DESC);
```

---

#### Estimate

```sql
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,

  -- Pricing
  pricing_mode VARCHAR(20) NOT NULL, -- 'by_job', 'by_hour'

  -- Line items (flexible structure for different pricing components)
  line_items JSONB NOT NULL,
  /* Example structure:
  [
    {
      "category": "labor",
      "description": "Furniture moving",
      "quantity": 1,
      "unit_price": 150,
      "total": 150
    },
    {
      "category": "modifier",
      "description": "2nd floor stairs",
      "quantity": 1,
      "unit_price": 25,
      "total": 25
    },
    {
      "category": "disposal",
      "description": "Haul-away fee",
      "quantity": 3,
      "unit_price": 15,
      "total": 45
    }
  ]
  */

  -- Totals
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,

  -- Terms
  terms TEXT, -- "Includes up to 3 hours labor. Materials billed separately."
  inclusions TEXT[], -- Array of what's included
  exclusions TEXT[], -- Array of what's NOT included

  -- Validity
  expiration_date DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'declined', 'expired'
  sent_at TIMESTAMP,
  accepted_at TIMESTAMP,
  declined_at TIMESTAMP,
  declined_reason TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100), -- Admin user who created it

  -- Follow-up
  follow_up_scheduled_at TIMESTAMP
);

CREATE INDEX idx_estimates_request ON estimates(request_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_expiration ON estimates(expiration_date);
```

---

#### Job

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  estimate_id UUID REFERENCES estimates(id),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_window VARCHAR(20) NOT NULL, -- '9-11am', '11-1pm', etc.
  scheduled_start TIMESTAMP, -- Exact start time if confirmed
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,

  -- Duration
  estimated_duration_hours DECIMAL(4, 2),
  actual_duration_hours DECIMAL(4, 2),

  -- Crew (simple for single-person operation)
  crew VARCHAR(100), -- "You" or team member names later

  -- Location
  address_id UUID REFERENCES customer_addresses(id),

  -- Status
  status VARCHAR(50) DEFAULT 'scheduled',
  -- 'scheduled' → 'confirmed' → 'in_progress' → 'completed' → 'paid' → 'closed'

  -- Completion details
  completion_notes TEXT,
  before_photos JSONB,
  after_photos JSONB,

  -- Financial
  final_amount DECIMAL(10, 2), -- May differ from estimate
  payment_method VARCHAR(50), -- 'cash', 'check', 'venmo', 'stripe', etc.
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  paid_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  -- Calendar integration
  calendar_event_id VARCHAR(255), -- Google Calendar event ID
  calendar_synced_at TIMESTAMP
);

CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_payment_status ON jobs(payment_status);
```

---

#### Review

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,

  -- Publication
  permission_to_publish BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,

  -- Response
  admin_response TEXT,
  responded_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_job ON reviews(job_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_published ON reviews(published, featured);
```

---

### Supporting Tables

#### Pricing Config

```sql
CREATE TABLE pricing_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Package details
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'hauling', 'handyman', etc.
  description TEXT,

  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,

  -- Modifiers (optional)
  modifiers JSONB,
  /* Example:
  {
    "stairs_per_floor": 25,
    "heavy_item_over_50lbs": 15,
    "distance_per_mile_over_15": 2
  }
  */

  -- Inclusions/exclusions
  inclusions TEXT[],
  exclusions TEXT[],

  -- Display
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_packages_category ON pricing_packages(category);
CREATE INDEX idx_packages_active ON pricing_packages(is_active);
```

#### Hourly Rates

```sql
CREATE TABLE hourly_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Rate details
  service_type VARCHAR(100), -- NULL for default rate, or specific service
  rate_per_hour DECIMAL(10, 2) NOT NULL,
  minimum_hours DECIMAL(4, 2) DEFAULT 2,

  -- Travel fees
  travel_fee_base DECIMAL(10, 2),
  travel_fee_per_mile DECIMAL(10, 2),
  free_radius_miles INTEGER DEFAULT 15,

  -- Validity
  effective_date DATE NOT NULL,
  expiration_date DATE,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hourly_rates_active ON hourly_rates(is_active, effective_date);
```

#### Service Area

```sql
CREATE TABLE service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Geographic definition
  city VARCHAR(100),
  zip_code VARCHAR(10),

  -- Geometry (for complex shapes)
  boundary_polygon JSONB, -- GeoJSON polygon for mapping

  -- Pricing
  is_primary_area BOOLEAN DEFAULT false,
  travel_fee_override DECIMAL(10, 2), -- Override default travel fee

  -- Status
  is_active BOOLEAN DEFAULT true,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_area_zip ON service_areas(zip_code);
CREATE INDEX idx_service_area_city ON service_areas(city);
```

---

## Admin Dashboard Architecture

### Dashboard Home

**Purpose:** Operational command center for daily work.

#### Today's Jobs (Primary Widget)
- List of jobs scheduled for today
- Sorted by time window
- Quick status updates
- Direct navigation to job details

**Display Fields:**
- Time window
- Customer name + phone (click to call)
- Address (click for maps)
- Service type
- Status indicator
- Quick actions: "Start job", "Mark complete", "Call customer"

---

#### New Requests Needing Estimates (Secondary Widget)
- Requests in `new` or `reviewing` status
- Sorted by urgency (today → this week → flexible)
- Photo thumbnails visible
- Quick triage

**Display Fields:**
- Request time (how long waiting)
- Customer name
- Service category
- Urgency badge
- Photo count indicator
- Quick actions: "Review", "Create estimate", "Call customer"

---

#### Messages / Call-Backs (Tertiary Widget)
- Follow-ups scheduled for today
- Declined estimates (opportunity for follow-up)
- Rescheduling requests

---

#### Quick Actions (Floating Buttons)
- "+ New request" (manual phone booking entry)
- "Create estimate"
- "Schedule job"
- "View calendar"

---

### Requests Inbox

**Purpose:** Manage incoming service requests.

#### Filters
- **Status:** All / New / Reviewing / Estimate Sent / Accepted
- **Urgency:** All / Today / This Week / Flexible
- **Category:** All / Hauling / Handyman / Yard Work / General Labor
- **Date range:** Last 7 days / 30 days / All time

#### List View

**Each request shows:**
- Thumbnail (if photos uploaded)
- Customer name + contact info
- Request date/time
- Service category
- Description preview (first 100 chars)
- Urgency badge
- Status badge

**Actions (per request):**
- "View full details"
- "Generate estimate draft"
- "Send estimate"
- "Call customer"
- "Schedule job"
- "Archive"

#### Detail View (When clicking request)

**Tabs:**
1. **Overview**
   - Full description
   - All photos (gallery view)
   - Customer info + history
   - Requested time windows
   - Admin notes (internal)

2. **Estimate**
   - Estimate builder tool (see below)
   - Previous estimates (if any)
   - Send estimate button

3. **Activity**
   - Timeline of status changes
   - Messages sent/received
   - Admin actions logged

---

### Estimate Builder

**Purpose:** Create accurate estimates quickly.

#### Step 1: Pricing Mode
- Radio buttons: By Job / By Hour

#### Step 2: Base Configuration

**If "By Job":**
- Dropdown: Select package template (or "Custom")
- Base price auto-fills
- Description auto-fills

**If "By Hour":**
- Input: Estimated hours
- Rate auto-fills from config
- Minimum hours enforced

#### Step 3: Modifiers (Checklist)
- [ ] Stairs (specify # floors)
- [ ] Heavy items >50lbs (specify # items)
- [ ] Disposal required (specify # items or volume)
- [ ] Distance >15 miles (auto-calculate if address provided)
- [ ] After-hours (weekend/evening surcharge)
- [ ] Materials needed (specify)

**Each modifier auto-calculates price impact.**

#### Step 4: Line Items Review
- Table showing all line items
- Edit/remove capability
- Add custom line item button

#### Step 5: Terms & Inclusions
- Template dropdown for common terms
- Checkboxes for inclusions (e.g., "Disposal included", "Materials included")
- Checkboxes for exclusions (e.g., "Electrical work", "Plumbing")

#### Step 6: Preview & Send
- Formatted estimate preview (customer view)
- Set expiration date (default: 7 days)
- Send method: SMS, Email, or Both
- "Save as draft" or "Send now"

**Behind the scenes:**
- Create Estimate record (status: `draft` or `sent`)
- If sent: trigger notification
- Update Service Request status to `estimate_sent`
- Log activity

---

### Schedule Calendar

**Purpose:** Visual scheduling and time management.

#### Views
- **Day:** Hourly breakdown
- **Week:** 5-day work week
- **Month:** Overview (Phase 2)

#### Calendar Events (Jobs)
- Color-coded by status:
  - Blue: Scheduled
  - Green: Confirmed
  - Orange: In progress
  - Gray: Completed
- Display: Time window, customer name, service type

#### Interactions
- **Drag-and-drop:** Reschedule jobs
- **Click event:** View job details
- **Click empty slot:** Quick-add job

#### Auto-blocking (Phase 2)
- Travel time buffers between jobs
- Lunch breaks
- Non-working hours greyed out

#### Calendar Sync Status
- Indicator: "Synced with Google Calendar" or "Sync failed"
- Manual sync button
- Last sync timestamp

---

### Jobs Pipeline

**Purpose:** Track jobs from scheduled to paid.

#### Kanban Board View
- **Columns:** Scheduled → Confirmed → In Progress → Completed → Paid
- Drag-and-drop to update status
- Card shows: Customer, date, service, $ amount

#### List View (Alternative)
- Filterable by status, date range, payment status
- Sortable by date, customer, amount
- Bulk actions: "Mark completed", "Send payment reminder"

#### Job Detail Page

**Tabs:**
1. **Details**
   - Customer info
   - Address + map
   - Scheduled time
   - Estimate recap
   - Admin notes

2. **Execution**
   - Start/end timestamps (auto or manual)
   - Before/after photos upload
   - Completion notes
   - Actual duration tracking

3. **Payment**
   - Final amount (editable if differs from estimate)
   - Payment method
   - Payment status
   - Receipt generation

4. **History**
   - Activity timeline

---

### Customers

**Purpose:** Customer relationship management.

#### List View
- Search by name, phone, email
- Sort by: Last booking, Total bookings, Created date
- Filters: Active, Archived, VIP (repeat customers)

#### Customer Detail Page

**Sections:**

1. **Contact Info**
   - Name, phone, email
   - Preferred contact method
   - All addresses

2. **Booking History**
   - List of all jobs (completed + scheduled)
   - Total lifetime value
   - Average job value
   - Frequency (jobs per year)

3. **Notes & Preferences**
   - Admin notes (gate codes, accessibility needs, etc.)
   - Service preferences
   - Payment method preference

4. **Quick Actions**
   - "Book new job for this customer"
   - "Send message"
   - "Call customer"

---

### Pricing Config

**Purpose:** Manage pricing without code changes.

#### By-Job Packages
- List of active packages
- Add/edit/deactivate packages
- Drag to reorder (display order on website)

**Edit Package Form:**
- Name, category, description
- Base price
- Modifiers configuration
- Inclusions/exclusions
- Is active toggle

#### Hourly Rates
- Current rate configuration
- Rate history (past rates with effective dates)
- Edit current rate
- Schedule future rate change

#### Modifiers Library
- List of all modifiers (stairs, heavy items, etc.)
- Price per modifier
- Edit/add/remove

---

## Notifications Architecture

### Customer Notifications

#### 1. Booking Confirmation
**Trigger:** Service request submitted

**Channels:** SMS + Email

**Content:**
```
Hi [Name], thanks for requesting help from Odd Job Heroes!

What: [Service category]
When requested: [Date/time windows]

We'll review your request and send an estimate within [X hours].

Questions? Reply to this text or call [PHONE].
```

---

#### 2. Estimate Sent
**Trigger:** Admin sends estimate

**Channels:** SMS (with link) + Email

**Content:**
```
Hi [Name], your estimate is ready!

Job: [Description]
Total: $[Amount]

View & accept: [SHORT_LINK]

This estimate expires on [DATE].

Questions? Call [PHONE].
```

**Email includes:**
- Full estimate breakdown
- Terms & conditions
- Accept/Decline buttons

---

#### 3. Estimate Accepted (Confirmation)
**Trigger:** Customer accepts estimate

**Channels:** SMS + Email

**Content:**
```
We're scheduled!

Date: [Date]
Time: [Window]
Address: [Address]

We'll send a reminder the day before.

Add to calendar: [.ics link]
```

---

#### 4. Appointment Reminder (24 hours)
**Trigger:** 24 hours before scheduled start

**Channels:** SMS (+ optional email)

**Content:**
```
Reminder: Odd Job Heroes tomorrow!

Time: [Window]
Address: [Address]

Need to reschedule? Call [PHONE].
```

---

#### 5. Appointment Reminder (2 hours)
**Trigger:** 2 hours before scheduled start (optional)

**Channels:** SMS only

**Content:**
```
We'll be there in about 2 hours ([Window]).

See you soon!
- Odd Job Heroes
```

---

#### 6. Job Completed
**Trigger:** Admin marks job as completed

**Channels:** SMS + Email

**Content:**
```
Thanks for choosing Odd Job Heroes!

Job completed: [Date]
Total: $[Amount]

We'd love your feedback: [Review link]
```

---

#### 7. Review Request
**Trigger:** 24 hours after job completion (if not already reviewed)

**Channels:** Email (+ optional SMS)

**Content:**
```
Hi [Name],

How did we do? Your feedback helps us improve.

Leave a review: [LINK]

(Takes 30 seconds)
```

---

### Admin Notifications

#### 1. New Request Alert
**Trigger:** Service request submitted

**Channels:** SMS + dashboard badge

**Content:**
```
New request from [Customer Name]

Category: [Service]
Urgency: [Today/This week/Flexible]
Photos: [Yes/No]

View: [DASHBOARD_LINK]
```

---

#### 2. Estimate Accepted
**Trigger:** Customer accepts estimate

**Channels:** SMS + dashboard badge

**Content:**
```
[Customer Name] accepted estimate!

Job: [Service]
Amount: $[Total]

Schedule now: [LINK]
```

---

#### 3. Estimate Declined
**Trigger:** Customer declines estimate

**Channels:** Dashboard notification (not SMS - less urgent)

**Content:**
- Shows declined estimate in dashboard
- Prompts: "Follow up?" (optional)

---

#### 4. Upcoming Job Alert
**Trigger:** Morning of job day (e.g., 7am)

**Channels:** SMS

**Content:**
```
Today's jobs:

9-11am: [Customer] - [Service] - [Address]
1-3pm: [Customer] - [Service] - [Address]

View schedule: [LINK]
```

---

#### 5. Reschedule Request
**Trigger:** Customer requests reschedule

**Channels:** SMS + dashboard

**Content:**
```
[Customer Name] requested reschedule

Original: [Date] [Time]
Requested: [New preference]

Approve: [LINK]
```

---

#### 6. Payment Reminder (Internal)
**Trigger:** Job completed but payment pending for >3 days

**Channels:** Dashboard task list

**Content:**
- Task: "Follow up on payment - [Customer]"
- Job details + contact info

---

### Notification Delivery System

#### Infrastructure
- **SMS:** Twilio API
- **Email:** Postmark or SendGrid (transactional email optimized)

#### Templates
- Stored in database (`notification_templates` table)
- Variables: `{customer_name}`, `{service_category}`, etc.
- Admin can edit templates (Phase 2)

#### Logging
```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Target
  customer_id UUID REFERENCES customers(id),

  -- Message
  notification_type VARCHAR(100), -- 'booking_confirmation', 'estimate_sent', etc.
  channel VARCHAR(20), -- 'sms', 'email'

  -- Content
  subject VARCHAR(255),
  body TEXT,

  -- Delivery
  status VARCHAR(20), -- 'sent', 'delivered', 'failed'
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  error_message TEXT,

  -- External IDs
  provider_message_id VARCHAR(255), -- Twilio SID, SendGrid ID, etc.

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notif_customer ON notification_logs(customer_id);
CREATE INDEX idx_notif_type ON notification_logs(notification_type);
CREATE INDEX idx_notif_status ON notification_logs(status);
```

---

## Security & Trust

### Data Protection

#### HTTPS Everywhere
- Force HTTPS on all pages
- HSTS headers enabled
- No mixed content

#### Minimal Data Collection
**Only collect what's necessary:**
- Name, phone, address (for service delivery)
- Email (optional - for notifications)
- Payment info (processed by Stripe - never stored directly)

**No tracking:**
- No Google Analytics (or privacy-focused alternative like Plausible)
- No Facebook Pixel
- No third-party ad networks

#### Database Security
- Encrypted at rest (database provider default)
- Encrypted in transit (SSL)
- No sensitive data in logs
- Regular backups (daily snapshots)

---

### Authentication & Access

#### Admin Access
- Password authentication (strong password requirements)
- Optional 2FA (Phase 2)
- Session timeout (4 hours)
- IP whitelisting option (Phase 2)

#### Customer Portal (Phase 2)
- Magic link authentication (email-based, no passwords)
- Short-lived tokens (15 minutes for estimate acceptance)
- No persistent login for now

---

### Photo Storage

#### Implementation
- Supabase Storage or S3
- **Signed URLs:** All photo access requires temporary signed URL
- Private buckets (not publicly accessible)
- URL expiration: 1 hour

#### Upload Security
- File type validation (JPEG, PNG, HEIC only)
- File size limit: 10MB per image
- Virus scanning (ClamAV or cloud service)
- Automatic image optimization (resize to max 2000px, compress)

#### Retention Policy
- Keep photos for 1 year after job completion
- Auto-archive to cold storage after 90 days
- Customer can request deletion (GDPR-style)

---

### Form Security

#### CAPTCHA
- Google reCAPTCHA v3 (invisible) on booking form
- Fallback to v2 (checkbox) if score too low
- Exception: Repeat customers with valid session

#### Rate Limiting
- 5 booking submissions per IP per hour
- 10 photo uploads per IP per hour
- Exponential backoff on failures

#### Input Validation
- Server-side validation (never trust client)
- SQL injection protection (parameterized queries)
- XSS protection (sanitize all user input)
- CSRF tokens on all forms

---

### Privacy Policy (Customer-Facing)

**Key Points:**

> **We Don't Sell Your Info. Ever.**
>
> We collect your name, phone, and address to provide service. We use it to contact you, schedule jobs, and send reminders.
>
> **We never:**
> - Sell your information
> - Share with advertisers
> - Send spam
>
> **We do:**
> - Send booking confirmations and reminders
> - Store photos you upload (for estimates only)
> - Keep job history (so we can serve you better next time)
>
> **You can:**
> - Request your data
> - Delete your account
> - Opt out of promotional messages (we rarely send them anyway)
>
> Questions? Call [PHONE].

**Full policy link:** In footer (legally compliant but still plain English)

---

### Trust Signals

#### On Website
- "Family-owned business" or "Locally operated"
- Years in business (if applicable)
- License/insurance info (if required in your state)
- BBB rating or similar (if applicable)

#### In Booking Flow
- "Your information is never sold or shared"
- Lock icon + "Secure booking"
- "We'll never surprise you with hidden fees"

#### In Communications
- Real name (not "no-reply@")
- Local phone number (not 1-800)
- Reply capability on SMS

---

## API Endpoints

### Public API (Customer-Facing)

#### POST `/api/requests`
Create new service request

**Request:**
```json
{
  "customer": {
    "name": "Margaret Smith",
    "phone": "+15551234567",
    "email": "margaret@example.com",
    "preferred_contact": "phone"
  },
  "address": {
    "street": "123 Main St",
    "unit": "Apt 2B",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701"
  },
  "service": {
    "category": "hauling",
    "description": "Need help moving couch to second floor",
    "urgency": "this_week"
  },
  "requested_windows": [
    {"date": "2026-01-28", "window": "9-11am"},
    {"date": "2026-01-29", "window": "11-1pm"}
  ]
}
```

**Response:**
```json
{
  "request_id": "uuid",
  "status": "received",
  "estimated_response_time": "2 hours",
  "confirmation_sent": true
}
```

---

#### POST `/api/requests/photo-estimate`
Upload photos for estimate

**Request:** `multipart/form-data`
- `photos[]`: Files
- `description`: String
- `customer`: JSON
- `address`: JSON

**Response:**
```json
{
  "request_id": "uuid",
  "photos_uploaded": 3,
  "status": "reviewing",
  "message": "We'll send your estimate within 2 hours"
}
```

---

#### GET `/api/estimates/:token`
View estimate (short-lived token from SMS/email)

**Response:**
```json
{
  "estimate_id": "uuid",
  "customer_name": "Margaret",
  "service_description": "Couch moving to 2nd floor",
  "line_items": [
    {"description": "Labor", "amount": 150},
    {"description": "Stairs (2nd floor)", "amount": 25}
  ],
  "total": 175,
  "expires_at": "2026-01-30",
  "terms": "Includes up to 2 hours labor..."
}
```

---

#### POST `/api/estimates/:token/accept`
Accept estimate

**Request:**
```json
{
  "preferred_date": "2026-01-28",
  "preferred_window": "9-11am"
}
```

**Response:**
```json
{
  "job_id": "uuid",
  "status": "scheduled",
  "scheduled_date": "2026-01-28",
  "scheduled_window": "9-11am",
  "calendar_link": "https://..."
}
```

---

### Admin API (Private)

#### GET `/api/admin/dashboard`
Dashboard stats

**Response:**
```json
{
  "todays_jobs": [...],
  "new_requests_count": 3,
  "estimates_pending": 2,
  "jobs_this_week": 8,
  "revenue_this_month": 4500
}
```

---

#### GET `/api/admin/requests`
List requests (with filters)

**Query params:**
- `status`: new, reviewing, etc.
- `urgency`: today, this_week, flexible
- `category`: hauling, handyman, etc.
- `page`, `limit`

---

#### POST `/api/admin/estimates`
Create estimate

**Request:**
```json
{
  "request_id": "uuid",
  "pricing_mode": "by_job",
  "line_items": [...],
  "terms": "...",
  "send_immediately": true
}
```

---

#### PUT `/api/admin/jobs/:id`
Update job status

**Request:**
```json
{
  "status": "completed",
  "actual_start": "2026-01-28T09:15:00Z",
  "actual_end": "2026-01-28T11:30:00Z",
  "completion_notes": "Completed as expected",
  "payment_method": "cash",
  "payment_status": "paid"
}
```

---

## Storage & Media

### Photo Storage Structure

```
/customers/{customer_id}/requests/{request_id}/
  - original/
    - photo1.jpg
    - photo2.jpg
  - thumbnails/
    - photo1_thumb.jpg
    - photo2_thumb.jpg

/jobs/{job_id}/
  - before/
    - before1.jpg
  - after/
    - after1.jpg
    - after2.jpg
```

### File Naming Convention
`{timestamp}_{random_string}.{ext}`

Example: `1706123456_a3f9k2.jpg`

### Metadata (Stored in DB)
```json
{
  "filename": "1706123456_a3f9k2.jpg",
  "original_name": "couch_photo.jpg",
  "size_bytes": 2458392,
  "mime_type": "image/jpeg",
  "uploaded_at": "2026-01-25T10:30:00Z",
  "url": "https://storage.../signed_url",
  "thumbnail_url": "https://storage.../thumb_signed_url"
}
```

---

## What This Demonstrates

### Database Design
- **Normalized schema** with proper relationships
- **Flexible JSONB fields** for variable structures (line items, modifiers)
- **Indexes optimized** for common queries
- **Status pipelines** with clear state transitions

### Admin UX
- **Operational efficiency** (dashboard shows today's priorities)
- **Estimate builder** that's faster than spreadsheets
- **Calendar-first scheduling** (visual, drag-and-drop)
- **Customer context** always available (notes, history)

### Notification Strategy
- **Transactional, not promotional** (only useful messages)
- **Multi-channel** (SMS for urgency, email for details)
- **Timely triggers** (confirmations immediate, reminders strategic)
- **Admin alerts** balanced (important pings, not noise)

### Security Posture
- **Privacy-first** (minimal data, no selling)
- **Secure by default** (HTTPS, signed URLs, input validation)
- **Customer trust** as differentiator (clear policies, local operation)
- **Compliance-ready** (GDPR-style data rights)

---

This data model isn't just tables. It's **the operational backbone** that lets you run the business without drowning in spreadsheets.
