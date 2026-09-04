# CODEX BUILD INSTRUCTIONS
## JOHNSON UNTUK KALIMANTAN — Public Transparency Dashboard

You are building a production-ready public campaign landing page and transparency dashboard for:

# JOHNSON UNTUK KALIMANTAN

This campaign commits **10% of qualifying Johnson sales during the campaign period to Kalimantan**.

The website is not just a campaign landing page. It must function as a **public transparency dashboard** that can be updated manually every day through the repository, committed to GitHub, and automatically deployed through Vercel.

For this first version:

- DO NOT use Supabase.
- DO NOT use Firebase.
- DO NOT use any external database.
- DO NOT require a CMS.
- DO NOT require an admin dashboard.
- DO NOT require authentication.
- Store campaign data locally in the repository.
- Daily updates must be possible by editing one simple data file only.
- Deployment target: **Vercel**
- Source control: **GitHub**
- The website must be fully **mobile friendly** and responsive.

---

# 1. PRIMARY GOAL

Create a public-facing campaign website that makes the donation commitment easy to understand and easy to verify.

The communication hierarchy should be:

**NUMBER → PROOF → MECHANISM → STORY → ACTION**

Visitors must immediately understand:

1. What the campaign is.
2. How much has been accumulated.
3. That 10% of qualifying campaign sales are allocated.
4. When the dashboard was last updated.
5. How the donation number was calculated.
6. How much has already been disbursed.
7. Where proof of disbursement will appear.
8. That the data is updated daily.

Do not describe the dashboard as "real-time" if it is only updated once per day.

Use:

**UPDATED DAILY**

or:

**DAILY TRANSPARENCY DASHBOARD**

---

# 2. CAMPAIGN NAME

Always use the exact campaign name:

# JOHNSON UNTUK KALIMANTAN

Do not rename it.

Do not shorten it in primary campaign headings.

---

# 3. CORE CAMPAIGN MESSAGE

Primary message:

> 10% dari penjualan campaign Johnson dialokasikan untuk Kalimantan.

Supporting message:

> Setiap pembelian yang memenuhi ketentuan campaign ikut berkontribusi. Data diperbarui setiap hari dan dapat dilihat secara terbuka di halaman ini.

Important clarification:

The customer is not charged an additional donation fee.

The campaign contribution is an allocation from Johnson's qualifying campaign sales.

Avoid misleading wording.

---

# 4. VISUAL DIRECTION

The visual identity must feel:

- premium
- credible
- environmental
- transparent
- editorial
- modern
- data-driven
- not corporate CSR-template-looking
- not overly decorative
- not childish
- not overly minimalist
- not like an admin SaaS dashboard

The design direction should feel like:

**financial transparency dashboard × environmental movement × premium campaign landing page**

---

# 5. COLOR SYSTEM

Background must be predominantly:

**WHITE**

Primary visual family:

**GREEN**

Use multiple green tones:

- Deep forest green
- Dark green
- Mid green
- Soft sage
- Very light green
- Off-white green-tinted surface

Accent:

**ORANGE**

Use orange sparingly for:

- campaign status
- small highlights
- important indicators
- chart points
- percentage emphasis
- progress accents
- small callouts

Secondary contrast:

**BLACK**

Use black for:

- typography
- contrast sections
- important labels
- footer / manifesto accents when appropriate

Suggested palette:

```css
:root {
  --white: #ffffff;

  --green-950: #0b2f24;
  --green-900: #0f3d2e;
  --green-800: #155238;
  --green-700: #1e6a45;
  --green-600: #2f7d50;
  --green-500: #4f9463;
  --green-300: #9bc7a5;
  --green-100: #eaf5ec;
  --green-050: #f5faf6;

  --orange: #f26a2e;
  --orange-dark: #d84f17;

  --black: #111111;
  --muted: #5d695f;
  --line: #d8e5da;
}
```

Do not make orange the dominant color.

The overall page should visually read as:

**WHITE + GREEN first, ORANGE second, BLACK for contrast.**

---

# 6. RESPONSIVE / MOBILE-FIRST REQUIREMENT

This requirement is critical.

The site must be built mobile-first.

It must look excellent at:

- 320px
- 360px
- 375px
- 390px
- 430px
- 768px
- 1024px
- 1280px+
- 1440px+

The mobile version is not allowed to look like a compressed desktop site.

Design mobile intentionally.

Requirements:

- No horizontal scrolling.
- No text clipping.
- No giant typography overflowing the viewport.
- Cards must stack cleanly.
- Tables must remain usable.
- Charts must resize properly.
- Buttons must have comfortable tap sizes.
- Navigation must simplify appropriately.
- Hero content must remain visually strong on mobile.
- Large numbers must scale using `clamp()`.
- Use CSS Grid/Flexbox responsively.
- Keep page padding between approximately 16–24px on mobile.
- Avoid fixed-width layouts.
- Use `max-width` containers.
- Tables may use horizontal scroll only inside the table component itself.
- Any SVG chart must use responsive `viewBox`.
- All clickable targets should ideally be at least 44px high.

Before considering the implementation complete, verify visually at:

```text
375 × 812
390 × 844
430 × 932
768 × 1024
1440 × 900
```

---

# 7. REQUIRED PAGE STRUCTURE

Build the landing page using the following structure.

## A. Sticky Navigation

Include:

- JOHNSON UNTUK KALIMANTAN
- Transparansi
- Alur Dana
- Bukti
- UPDATED DAILY indicator

On mobile:

- Keep the brand visible.
- Simplify or hide secondary navigation.
- Do not let the navbar become crowded.

---

## B. Hero Section

The hero should immediately communicate the campaign.

Suggested hierarchy:

```text
PUBLIC TRANSPARENCY DASHBOARD

JOHNSON
UNTUK
KALIMANTAN

10% dari penjualan campaign Johnson dialokasikan untuk Kalimantan.

Rp XXX.XXX.XXX
TOTAL DONASI TERKUMPUL

AND GROWING.

● UPDATED DAILY
Last updated: [date/time]
Day X / XX
X orders contributed
```

The total donation figure must be the strongest visual element.

Do not make the campaign title visually stronger than the donation number.

---

## C. Campaign Ticker

Below the hero, show a compact data ticker such as:

```text
TODAY +RpXX.XXX.XXX ↑
CAMPAIGN SALES RpX.XXX.XXX.XXX
ALLOCATION 10%
STATUS ACTIVE
```

The ticker may wrap cleanly on mobile.

---

## D. Live Numbers / Main Statistics

Show at minimum:

- Total Campaign Sales
- Donation Allocated
- Contributing Orders
- Campaign Day

Example:

```text
TOTAL CAMPAIGN SALES
Rp1.847.500.000

DONATION ALLOCATED
Rp184.750.000

CONTRIBUTING ORDERS
1.842

CAMPAIGN DAY
04 / 30
```

Values must be generated from the local campaign data file.

Do not hardcode these values inside multiple HTML components.

---

## E. Donation Target Progress

If a donation target exists, show:

- Donation target
- Current percentage
- Progress bar

Example:

```text
DONATION TARGET
Rp300.000.000

61.58%
```

The percentage must be calculated automatically.

If no target exists in the data file, hide this section gracefully.

---

## F. Donation Growth Chart

Show cumulative donation growth over time.

Chart data must come from daily campaign data.

The chart should:

- be responsive
- use green as main line color
- use orange as accent
- display cumulative donation
- not require an external paid chart library

Preferred options:

1. native SVG
2. lightweight vanilla JavaScript
3. Chart.js only if truly needed

Avoid unnecessary dependencies.

---

## G. Customer Contribution Calculator

Show a simple interactive calculator.

Example:

```text
Jika pembelian kamu:
Rp500.000

Maka Johnson mengalokasikan:
Rp50.000
```

Calculation:

```text
purchase value × donation rate
```

The donation rate must come from the data file.

Do not hardcode 10% in calculator logic if a global donation rate already exists in data.

---

## H. HOW THE MONEY MOVES

Show a clear visual sequence:

```text
01
Customer membeli produk Johnson

↓

02
Transaksi masuk campaign sales

↓

03
10% dihitung

↓

04
Masuk ke dana campaign

↓

05
Dana disalurkan

↓

06
Bukti dipublikasikan
```

On desktop this may appear as horizontal cards.

On mobile this should become a vertical or 2-column sequence.

---

## I. Daily Transparency Log

This is one of the most important sections.

Create a table generated dynamically from the daily data.

Columns:

```text
Tanggal
Penjualan Campaign
Alokasi Donasi
Total Donasi
Jumlah Order
```

Example:

```text
1 Sep 2026
Rp324.000.000
Rp32.400.000
Rp32.400.000
312
```

The newest row should be visually emphasized.

Do not manually duplicate this table in HTML.

Generate it from the campaign data file.

---

## J. Donation Status

Display:

- Total Committed
- Total Disbursed
- Waiting to Be Disbursed

Calculation:

```text
waitingToBeDisbursed = totalDonation - totalDisbursed
```

Never allow the displayed waiting amount to become negative.

If disbursement records exist, sum them automatically.

---

## K. Proof of Disbursement

If there are no disbursement records:

Display:

```text
Belum ada dana yang disalurkan.

Bukti penyaluran akan ditampilkan di sini setelah dana disalurkan.
```

If proof records exist:

Display:

- date
- amount
- recipient
- description
- proof link
- documentation link if available

Do not invent proof documents.

Only render links that exist in the data.

---

## L. Why Kalimantan

Include a short editorial section explaining the campaign.

Do not exaggerate environmental claims.

Avoid dramatic unsupported statistics.

Copy direction:

```text
Kebakaran hutan tidak berhenti ketika berita berhenti membicarakannya.

Dampaknya dapat menyentuh hutan, udara, satwa, dan masyarakat di sekitarnya.

JOHNSON UNTUK KALIMANTAN adalah upaya untuk mengubah sebagian aktivitas bisnis sehari-hari menjadi kontribusi yang dapat dilihat dan dipertanggungjawabkan.
```

Keep this section concise.

---

## M. Campaign Timeline

Generate from campaign configuration where possible.

Suggested:

```text
CAMPAIGN START
1 September 2026

UPDATED DAILY
Campaign data updates

CAMPAIGN CLOSE
30 September 2026

DONATION DISBURSEMENT
October 2026

FINAL REPORT
October 2026
```

---

## N. Final Manifesto / CTA

End with:

```text
THE NUMBER NEVER HIDES.

Kami percaya sebuah campaign tidak cukup hanya mengatakan:
“kami akan berdonasi.”

Kamu berhak mengetahui:
berapa yang terkumpul,
berapa yang dialokasikan,
kapan disalurkan,
dan ke mana dana tersebut pergi.

10%

Dari penjualan campaign Johnson.
Untuk Kalimantan.
Transparan setiap hari.
```

CTA options:

```text
BELANJA JOHNSON
LIHAT DATA
```

The shopping URL must come from configuration and must not be invented.

---

# 8. PROJECT STRUCTURE

Use a clean structure.

Recommended:

```text
johnson-untuk-kalimantan/
│
├── index.html
├── styles.css
├── script.js
│
├── data/
│   └── campaign.json
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── proofs/
│
├── README.md
├── CODEX_INSTRUCTIONS.md
└── vercel.json
```

If a framework is not necessary, prefer:

**HTML + CSS + Vanilla JavaScript**

Do not introduce React, Next.js, Vue, or other frameworks unless there is a clear implementation benefit.

This project should remain simple enough to update and deploy reliably.

---

# 9. SINGLE SOURCE OF TRUTH

All campaign numbers must originate from:

```text
/data/campaign.json
```

Do not scatter editable donation data across HTML and JavaScript files.

The daily update workflow must only require changing this JSON file.

---

# 10. CAMPAIGN DATA STRUCTURE

Use a structure similar to:

```json
{
  "campaign": {
    "name": "JOHNSON UNTUK KALIMANTAN",
    "status": "active",
    "donationRate": 0.10,
    "startDate": "2026-09-01",
    "endDate": "2026-09-30",
    "donationTarget": 300000000,
    "currency": "IDR",
    "shopUrl": "",
    "lastUpdated": "2026-09-04T12:00:00+07:00"
  },

  "daily": [
    {
      "date": "2026-09-01",
      "sales": 324000000,
      "orders": 312
    },
    {
      "date": "2026-09-02",
      "sales": 493500000,
      "orders": 481
    },
    {
      "date": "2026-09-03",
      "sales": 508500000,
      "orders": 502
    },
    {
      "date": "2026-09-04",
      "sales": 521500000,
      "orders": 547
    }
  ],

  "disbursements": []
}
```

Important:

The daily rows should store:

- date
- sales
- orders

The frontend should calculate donation values.

Do not manually store donation values unless necessary.

Calculation:

```javascript
dailyDonation = dailySales * donationRate
```

---

# 11. REQUIRED CALCULATIONS

The frontend must automatically calculate:

## Total Sales

```javascript
sum(daily.sales)
```

## Total Donation

```javascript
totalSales * donationRate
```

or equivalently:

```javascript
sum(daily.sales * donationRate)
```

## Total Orders

```javascript
sum(daily.orders)
```

## Today's Sales

Use latest daily record.

## Today's Donation

```javascript
latest.sales * donationRate
```

## Cumulative Donation by Day

For chart and transparency log.

## Campaign Day

Calculate from start date and latest published data date.

Do not rely only on the visitor's current date.

The dashboard should represent the latest published campaign data.

## Total Disbursed

```javascript
sum(disbursements.amount)
```

## Waiting to Be Disbursed

```javascript
Math.max(totalDonation - totalDisbursed, 0)
```

## Target Progress

```javascript
(totalDonation / donationTarget) * 100
```

Cap the visual progress bar at 100%.

The text may display more than 100% if the campaign exceeds the target.

---

# 12. NUMBER FORMATTING

Use Indonesian currency formatting.

Example:

```javascript
new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
})
```

Expected visual output:

```text
Rp184.750.000
```

Avoid:

```text
IDR 184,750,000
```

for the primary UI.

---

# 13. DATE FORMATTING

Use Indonesian-readable dates.

Example:

```text
4 September 2026
```

For compact display:

```text
4 Sep 2026
```

Always display timezone when showing update time:

```text
12:00 WIB
```

Use Asia/Jakarta semantics for campaign timestamps.

---

# 14. DAILY MANUAL UPDATE WORKFLOW

The website will initially be updated manually through Codex.

A daily update should work like this:

User gives Codex:

```text
Update JOHNSON UNTUK KALIMANTAN untuk 5 September 2026.

Sales hari ini:
Rp430.000.000

Orders:
428

Last updated:
5 September 2026, 12:00 WIB

Do not change the design.
Only update campaign data and verify all calculated values.
```

Codex must:

1. Open `/data/campaign.json`.
2. Check whether the date already exists.
3. If date does not exist, append a new daily row.
4. If date exists, update that row instead of creating a duplicate.
5. Update `campaign.lastUpdated`.
6. Do NOT manually edit calculated totals in HTML.
7. Verify JSON syntax.
8. Run the site locally.
9. Verify all totals.
10. Verify the latest row appears correctly.
11. Verify chart updates.
12. Verify mobile layout.
13. Commit changes.
14. Push to GitHub.
15. Let Vercel deploy automatically.

---

# 15. DAILY UPDATE SAFETY RULES

Before committing any daily data update:

Check:

```text
daily sales > 0
orders >= 0
donation rate is valid
date is within campaign period
no duplicate daily record
JSON parses successfully
```

Also check:

```text
today donation = today sales × donationRate
total donation = cumulative sales × donationRate
```

If numbers look unusually large compared with prior days, do not silently alter them.

Keep the supplied data but flag the anomaly in the Codex response before pushing if human verification is required.

Do not fabricate corrections.

---

# 16. OPTIONAL DISBURSEMENT DATA STRUCTURE

When donations begin to be transferred, add:

```json
"disbursements": [
  {
    "date": "2026-10-05",
    "amount": 100000000,
    "recipient": "Recipient Name",
    "description": "First campaign disbursement",
    "proofUrl": "/assets/proofs/transfer-2026-10-05.pdf",
    "documentationUrl": ""
  }
]
```

The frontend must automatically update:

```text
TOTAL DISBURSED
WAITING TO BE DISBURSED
PROOF OF DISBURSEMENT
```

Do not hardcode these values.

---

# 17. ERROR HANDLING

If `/data/campaign.json` cannot load:

Do not show fake numbers.

Display a graceful message such as:

```text
Data campaign sedang tidak tersedia.
Silakan kembali beberapa saat lagi.
```

Log the technical error to the browser console.

Do not expose stack traces to users.

---

# 18. ACCESSIBILITY

Implement basic accessibility.

Requirements:

- semantic HTML
- adequate color contrast
- meaningful button labels
- meaningful link labels
- `aria-label` where useful
- keyboard-friendly navigation
- images must have meaningful `alt`
- decorative images should use empty alt
- do not communicate meaning only through color

---

# 19. PERFORMANCE

Target a lightweight page.

Requirements:

- Minimize dependencies.
- Optimize images.
- Use WebP/AVIF where appropriate.
- Lazy-load images below the fold.
- Avoid autoplay video.
- Avoid huge JS bundles.
- Avoid heavy animation libraries unless necessary.
- Prefer CSS transitions.
- Avoid unnecessary network requests.

The dashboard should load quickly on mobile networks.

---

# 20. ANIMATION

Animations may be used, but must be subtle.

Allowed:

- number fade-in
- count-up animation
- chart draw animation
- gentle card reveal
- ticker entrance
- subtle hover states

Do not use:

- excessive parallax
- long cinematic intros
- animations that delay access to data
- aggressive scroll hijacking
- looping decorative animations that distract from transparency

The data must always remain the hero.

---

# 21. SEO / SOCIAL METADATA

Add:

```html
<title>JOHNSON UNTUK KALIMANTAN — Transparency Dashboard</title>
```

Suggested description:

```text
Dashboard transparansi JOHNSON UNTUK KALIMANTAN. Pantau perkembangan 10% alokasi penjualan campaign Johnson untuk Kalimantan, diperbarui setiap hari.
```

Add:

- Open Graph title
- Open Graph description
- Open Graph image placeholder
- Twitter card metadata
- favicon placeholder

Do not invent final social images if assets are not available.

---

# 22. VERCEL DEPLOYMENT

The project must deploy successfully to Vercel.

For a static HTML/CSS/JS site, keep deployment simple.

Recommended:

```json
{
  "cleanUrls": true
}
```

in:

```text
vercel.json
```

Do not add unnecessary serverless functions.

Expected deployment flow:

```text
Local Project
↓
GitHub Repository
↓
Vercel
↓
Automatic deployment after every push
```

---

# 23. GITHUB WORKFLOW

Initial project:

```bash
git init
git add .
git commit -m "Initial JOHNSON UNTUK KALIMANTAN dashboard"
git branch -M main
git remote add origin <REPOSITORY_URL>
git push -u origin main
```

Future campaign update example:

```bash
git add data/campaign.json
git commit -m "Update campaign data 2026-09-05"
git push origin main
```

Do not commit secrets.

No API keys are required for this version.

---

# 24. README REQUIREMENT

Create a `README.md` explaining:

- what the project is
- local development
- campaign data structure
- how to update daily data
- how calculations work
- GitHub push workflow
- Vercel deployment
- how to add proof of disbursement
- mobile QA checklist

Keep it understandable for a non-engineer.

---

# 25. MOBILE QA CHECKLIST

Before every major release, verify:

## 375px

- Hero does not overflow.
- Donation number fits.
- Header is usable.
- Stats stack cleanly.
- Calculator is usable.
- Flow section is understandable.
- Table can be used without breaking page layout.
- Buttons fit.
- No horizontal page scrolling.

## 430px

Repeat all checks.

## Tablet

- Cards use space efficiently.
- Typography is not oversized.
- Navigation remains clear.

## Desktop

- Content should not stretch excessively.
- Use a max-width container.
- Large whitespace should feel intentional.
- Data hierarchy remains obvious.

---

# 26. DESKTOP QA CHECKLIST

Verify:

```text
1280 × 800
1440 × 900
1920 × 1080
```

Check:

- hero balance
- donation figure
- chart width
- grid spacing
- card heights
- table readability
- final CTA
- footer spacing

---

# 27. CONTENT RULES

Use Indonesian as the primary campaign language.

English may be used selectively for visual punch, for example:

```text
AND GROWING.
UPDATED DAILY.
THE NUMBER NEVER HIDES.
PUBLIC TRANSPARENCY DASHBOARD.
```

Do not overuse English.

Primary factual explanations should remain in Indonesian.

---

# 28. TRUST RULES

Because this is a transparency campaign:

Never:

- invent donation proof
- invent partner names
- invent NGO names
- invent transfer dates
- invent campaign sales
- invent environmental impact numbers
- imply money has been transferred before it has been transferred
- call estimated numbers "verified"
- hide the update date
- label daily-updated data as live real-time data

If data is pending, say it is pending.

If no disbursement has happened, show zero.

Transparency is more important than visual perfection.

---

# 29. IMPORTANT UI PHRASES

Recommended phrases:

```text
JOHNSON UNTUK KALIMANTAN

10% DARI PENJUALAN CAMPAIGN JOHNSON, UNTUK KALIMANTAN.

TOTAL DONASI TERKUMPUL

AND GROWING.

UPDATED DAILY

KAMU ADA DI DALAM ANGKA INI.

BEGINI CARA DANA BERGERAK.

ANGKANYA BISA DILIHAT. SETIAP HARI.

DARI KOMITMEN MENJADI BUKTI.

THE NUMBER NEVER HIDES.

TRANSPARAN, SETIAP HARI.
```

---

# 30. DEVELOPMENT PRIORITIES

Priority order:

## Priority 1
Correct campaign data.

## Priority 2
Correct calculations.

## Priority 3
Mobile usability.

## Priority 4
Transparency and proof structure.

## Priority 5
Visual polish.

## Priority 6
Animation.

Never sacrifice data accuracy for animation or visual effects.

---

# 31. FIRST BUILD TASK

When starting from this instruction file:

1. Inspect the repository.
2. Preserve useful existing assets if available.
3. Build the project structure.
4. Create `/data/campaign.json`.
5. Build responsive HTML.
6. Build CSS based on the green/orange/black palette.
7. Build JavaScript data loader.
8. Calculate all public statistics automatically.
9. Generate the transparency table dynamically.
10. Generate chart data dynamically.
11. Implement donation calculator.
12. Implement graceful error handling.
13. Create README.
14. Create Vercel configuration if needed.
15. Test locally.
16. Test mobile.
17. Test desktop.
18. Check all numbers against the source JSON.
19. Commit the finished implementation.
20. Push to GitHub if repository access is configured.

---

# 32. DEFINITION OF DONE

The build is complete only if:

- `/data/campaign.json` is the single source of truth.
- Adding one new daily record updates the whole dashboard automatically.
- Donation calculations are automatic.
- Totals are not duplicated manually.
- Chart updates automatically.
- Transparency table updates automatically.
- Last update timestamp is visible.
- Campaign day is correct.
- Donation status is correct.
- Proof section supports future disbursement data.
- Layout is excellent on mobile.
- No page-level horizontal overflow exists.
- GitHub repository is clean.
- Vercel deployment succeeds.
- No database is required.
- No secrets are required.
- The website clearly communicates transparency.

---

# 33. EXAMPLE DAILY CODEX PROMPT

Use this format for future daily updates:

```text
Update data JOHNSON UNTUK KALIMANTAN.

Date:
5 September 2026

Today's campaign sales:
Rp430.000.000

Today's orders:
428

Last updated:
5 September 2026, 12:00 WIB

Instructions:
- Only update the campaign data source.
- Do not change the visual design.
- Do not manually edit calculated totals.
- Ensure there is no duplicate date.
- Verify donation calculation using the configured donation rate.
- Verify cumulative totals.
- Verify transparency table.
- Verify donation growth chart.
- Verify mobile layout is unaffected.
- Commit with:
  "Update campaign data 2026-09-05"
- Push to GitHub so Vercel redeploys.
```

---

# FINAL PRINCIPLE

This website must feel like a public record, not an advertisement pretending to be transparent.

The experience should make visitors think:

**“Saya bisa melihat angkanya, saya bisa melihat bagaimana angka itu dihitung, dan nanti saya juga bisa melihat ke mana uangnya disalurkan.”**

That is the core product.

# JOHNSON UNTUK KALIMANTAN
## THE NUMBER NEVER HIDES.
