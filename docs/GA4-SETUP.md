# Google Analytics 4 Setup Guide

## What's Already Sent to GA4

Every page view (after consent) automatically sends to `G-BHGE4494ZY`:

### 1. User-ID
Each browser gets a stable `visitor_id` (UUID) that's set as the GA4 User-ID.
This means GA4 treats the same browser as one user across sessions.

### 2. User Properties (persist across all events from this user)
| Property | Example |
|---|---|
| `ce_visitor_id` | `7a3f9b1c-8d4e-4f2a-bc91-...` |
| `device_type` | `mobile` / `tablet` / `desktop` |
| `language_pref` | `en-US` |
| `timezone` | `Asia/Manila` |
| `first_visit_date` | `2026-05-22` |
| `first_referrer` | `https://www.google.com/` |
| `first_landing` | `/blog/best-dive-sites-anilao.html` |
| `first_utm_source` | `facebook` |
| `first_utm_medium` | `cpc` |
| `first_utm_campaign` | `spring2026` |
| `is_returning` | `true` / `false` |
| `visitor_tier` | `1_new` / `2_browsing` / `3_engaged` / `4_loyal` / `5_super_loyal` |

### 3. Custom Events

**`visitor_view`** (every page view) — parameters:
- `visitor_id`, `session_count`, `total_pageviews`, `is_first_visit`,
  `device_type`, `referrer`, `landing_page`,
  `utm_source`, `utm_medium`, `utm_campaign`

**`first_visit_enriched`** (only on the very first page view of any visitor):
- `visitor_id`, `referrer`, `landing_page`, `device_type`, `utm_source`

---

## What YOU Need to Do in GA4 (one-time, ~10 minutes)

### Step 1: Register Custom Dimensions (so the user properties show up in reports)

1. Go to **GA4 → Admin** (gear icon, bottom left)
2. Under the Property column, click **Custom definitions**
3. Click **Create custom dimensions** → add these one by one:

| Dimension Name | Scope | User Property / Event Parameter | Description |
|---|---|---|---|
| Device Type | User | `device_type` | mobile / tablet / desktop |
| Language Pref | User | `language_pref` | Browser language |
| Timezone | User | `timezone` | User's timezone |
| First Visit Date | User | `first_visit_date` | YYYY-MM-DD of first visit |
| First Referrer | User | `first_referrer` | Where they first came from |
| First Landing | User | `first_landing` | First page they hit |
| First UTM Source | User | `first_utm_source` | Acquisition source |
| First UTM Medium | User | `first_utm_medium` | Acquisition medium |
| First UTM Campaign | User | `first_utm_campaign` | Acquisition campaign |
| Is Returning | User | `is_returning` | true / false |
| Visitor Tier | User | `visitor_tier` | 1_new through 5_super_loyal |
| CE Visitor ID | User | `ce_visitor_id` | Our internal ID |

### Step 2: Register Event Parameters

In the same **Custom definitions** screen:

| Dimension Name | Scope | Event Parameter |
|---|---|---|
| Total Pageviews | Event | `total_pageviews` |
| Session Count | Event | `session_count` |
| Is First Visit | Event | `is_first_visit` |
| UTM Source | Event | `utm_source` |
| UTM Medium | Event | `utm_medium` |
| UTM Campaign | Event | `utm_campaign` |

### Step 3: (Optional) Enable User-ID Reporting

1. Admin → **Reporting identity** (under Property column)
2. Change from **Blended** to **By User-ID, then device** (recommended)
3. Now GA4 will use our `visitor_id` as the primary identity

### Step 4: Build Custom Reports / Audiences

Once dimensions are registered, GA4 lets you:

**Audiences** (Admin → Audiences → New audience):
- "Engaged dive enthusiasts" — `visitor_tier = 3_engaged or 4_loyal or 5_super_loyal`
- "Returning blog readers" — `is_returning = true` AND `landing_page contains /blog/`
- "Facebook campaign visitors" — `first_utm_source = facebook`

**Custom Reports** (Reports → Library):
- Pageviews by `device_type`
- Visits by `first_utm_source` × `landing_page`
- Conversion rate by `visitor_tier`

**Explorations** (Explore → Free form):
- Drop in `Visitor Tier` as a dimension and any metric — instant breakdown

---

## How to Verify It's Working

### Real-time check
1. Go to **GA4 → Reports → Real-time**
2. Open your website in a private/incognito window
3. Accept the cookie banner
4. You should see the visit appear within 30 seconds
5. Scroll the real-time report to **Event count by Event name**
   - You should see `visitor_view` and `first_visit_enriched`

### Console check
1. Open your site
2. Open DevTools (F12) → Console
3. Type: `CE_VISITOR`
4. You'll see the full visitor object

### Cookie check
1. DevTools → Application tab → Cookies → your domain
2. Look for `ce_consent` and `ce_visitor`

### User Property check (delayed by ~24h)
1. GA4 → Reports → User → User attributes → User properties
2. Your custom user properties will appear once data has been processed
   (GA4 typically takes 24-48h to surface new custom properties)

---

## Data Flow Diagram

```
┌────────────┐     ┌──────────────────┐     ┌────────┐
│  Visitor   │────▶│  cookie-consent  │     │        │
└────────────┘     │      .js         │     │  GA4   │
                   └──────┬───────────┘     │        │
                          │ Accept          │        │
                          ▼                 │        │
                   ┌──────────────────┐     │        │
                   │   ce_consent     │     │        │
                   │    cookie        │     │        │
                   └──────┬───────────┘     │        │
                          │                 │        │
                          ▼                 │        │
                   ┌──────────────────┐     │        │
                   │ visitor-tracking │────▶│ User-ID│
                   │      .js         │────▶│  set   │
                   │                  │────▶│ Props  │
                   └──────┬───────────┘────▶│ Events │
                          │                 └────────┘
                          ▼
                   ┌──────────────────┐
                   │   ce_visitor     │
                   │     cookie       │
                   └──────────────────┘
                          │
                          ▼
                   ┌──────────────────┐
                   │  /my-data.html   │ ← visitor can view/delete
                   └──────────────────┘
```
