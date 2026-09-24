// Pink Lady — static site generator.
// Run: node build.mjs   (Node 18+, no dependencies)
// Writes every page as site/<slug>/index.html plus sitemap.xml.
// Edit copy here, then rebuild. CSS/JS/images in site/assets are hand-written and not touched.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), 'site');
const SITE_URL = 'https://pinklady.ie/';
const BIZ = {
  name: 'Pink Lady Cleaning',
  legal: 'Pink Lady Cleaning Services Ltd',
  phone: '086 165 5300',
  phoneIntl: '+353861655300',
  phoneDisplayIntl: '+353 86 165 5300',
  email: 'info@pinklady.ie',
  street: '11 Moyclare Avenue',
  locality: 'Baldoyle',
  region: 'Dublin 13',
  country: 'Ireland',
  // TODO: confirm with client that WhatsApp works on the same number (CLIENT_QUESTIONS.md #12)
  whatsapp: 'https://wa.me/353861655300?text=' + encodeURIComponent('Hello Pink Lady, I would like to ask about cleaning for my home.'),
};
const AREAS = ['Dublin City', 'Ranelagh', 'Rathmines', 'Ballsbridge', 'Dundrum', 'Sandyford', 'Blackrock', 'Clontarf', 'Drumcondra', 'Stillorgan', 'Malahide', 'Swords'];

/* ---------------------------------------------------------------------------
   Images — Unsplash placeholders. Every one is listed in IMAGES_TODO.md.
   Swap `src` for a local file (e.g. 'assets/img/hero.webp') when real photos arrive.
--------------------------------------------------------------------------- */
const IMG = {
  hero:      { id: '1600210492486-724fe5c67fb0', alt: 'Bright, spacious living room with tall windows and soft neutral furnishings' },
  living:    { id: '1600607687939-ce8a6c25118c', alt: 'Elegant open-plan living space with polished floors' },
  kitchen:   { id: '1600566753190-17f0baa2a6c3', alt: 'Spotless modern kitchen with marble island' },
  kitchen2:  { id: '1556912173-3bb406ef7e77', alt: 'Gleaming kitchen worktops and cabinetry' },
  exterior:  { id: '1600585154340-be6161a56a0c', alt: 'Contemporary family home at dusk' },
  villa:     { id: '1613490493576-7fde63acd811', alt: 'Large private residence with manicured grounds' },
  dining:    { id: '1600573472550-8090b5e0745e', alt: 'Formal dining room set for guests' },
  bedroom:   { id: '1505691938895-1758d7feb511', alt: 'Calm bedroom with crisp white linen' },
  bathroom:  { id: '1552321554-5fefe8c9ef14', alt: 'Marble bathroom with freestanding bath' },
  interior:  { id: '1618221195710-dd6b41faaea6', alt: 'Refined living room with designer furniture' },
  lounge:    { id: '1616486338812-3dadae4b4ace', alt: 'Sunlit lounge with soft upholstery' },
  sofa:      { id: '1586023492125-27b2c045efd7', alt: 'Upholstered sofa and rug in a light-filled room' },
  empty:     { id: '1600566753086-00f18fb6b3ea', alt: 'Newly finished interior, clean and ready to live in' },
  office:    { id: '1497366216548-37526070297c', alt: 'Clean, bright modern office' },
  stair:     { id: '1600047509807-ba8f99d2cdde', alt: 'Light-filled hallway and staircase in a large home' },
};
const unsplash = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
function img(key, { sizes = '100vw', eager = false, cls = '', widths = [640, 960, 1400, 2000], parallax } = {}) {
  const i = IMG[key];
  const srcset = widths.map((w) => `${unsplash(i.id, w)} ${w}w`).join(', ');
  return `<img src="${unsplash(i.id, widths[1] || widths[0])}" srcset="${srcset}" sizes="${sizes}" alt="${i.alt}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${cls ? ` class="${cls}"` : ''}${parallax ? ` data-parallax="${parallax}"` : ''}>`;
}

/* ---------------------------------------------------------------------------
   Icons
--------------------------------------------------------------------------- */
const ICON = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2m0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2m4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3"/></svg>',
  arrow: '<svg class="arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 8h13M9 3l5 5-5 5"/></svg>',
  chevron: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m2 4 4 4 4-4"/></svg>',
  plus: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M10 3v14M3 10h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m4 12.5 5 5L20 6.5"/></svg>',
  star: '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m10 1.5 2.6 5.6 6 .6-4.5 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.4 7.7l6-.6z"/></svg>',
  prev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M15 8H2M7 3 2 8l5 5"/></svg>',
  next: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 8h13M9 3l5 5-5 5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  family: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M12 20v-3a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3"/><path d="M15.5 14.5c1-1 2.5 0 1.3 1.3L15.5 17l-1.3-1.2c-1.2-1.3.3-2.3 1.3-1.3"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12"/><circle cx="12" cy="9" r="2.5"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="8" cy="14" r="4"/><path d="m11 11 9-9M17 5l2 2M15 7l2 2"/></svg>',
  gem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 18M15 3l-3 18"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/></svg>',
  spray: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M8 9h6v12H8zM9 9V6h4v3M13 6h3l2-2M17 7h2M17 10l2 1M17 4l2-1"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19 14 10"/></svg>',
};

/* ---------------------------------------------------------------------------
   Services
--------------------------------------------------------------------------- */
const SERVICES = [
  {
    slug: 'luxury-home-cleaning/', name: 'Luxury Home Cleaning', short: 'Regular, scheduled care from a team that knows your home.', img: 'living', img2: 'bedroom',
    title: 'Luxury Home & Housekeeping Cleaning Dublin | Pink Lady',
    desc: 'Regular luxury home cleaning in Dublin. Weekly, fortnightly or to your schedule, following a checklist built around your property. Family-run since 2006.',
    h1: 'Luxury Home Cleaning <em>in Dublin</em>',
    lead: 'Consistent, scheduled care for homes that need to look their best every day.',
    overviewTitle: 'Standards that <em>never slip</em>',
    body: [
      'Weekly, fortnightly or to your own schedule, our team follows a checklist built around your property so nothing is missed and standards never slip.',
      'Before the first visit we talk through your home, its finishes and the rooms that matter most to you. That conversation becomes a structured checklist, adjusted whenever your needs change.',
      'We arrive fully equipped with professional products and equipment, and you always deal directly with our team, never a call centre or an automated booking system.',
    ],
    listTitle: 'Ideal for',
    list: ['Large family homes', 'Penthouses and apartments', 'Period properties', 'Second homes and properties you are away from <!-- TODO: confirm with client (key-holding, cleaning while owners are away) -->'],
    tagsTitle: 'Scheduled to suit you',
    tags: ['Weekly', 'Fortnightly', 'Your own schedule'],
  },
  {
    slug: 'one-off-cleaning/', name: 'Deep Cleaning', short: 'A meticulous top-to-bottom reset, room by room.', img: 'kitchen', img2: 'bathroom',
    title: 'Deep Cleaning Dublin | One-Off Cleaning | Pink Lady',
    desc: 'One-off deep cleaning service in Dublin. Kitchens degreased, bathrooms descaled and every room brought back to a high standard. We bring all products and equipment.',
    h1: 'Deep Cleaning <em>in Dublin</em>',
    lead: 'Sometimes a home needs more than its usual clean. A one-off deep clean brings every room back to a high standard.',
    overviewTitle: 'A complete <em>reset</em>',
    body: [
      'Over time, everyday life catches up. Kitchens build up grease, bathrooms collect limescale, and skirting boards gather dust. A deep clean gives your home the attention needed to bring everything back to a high standard.',
      'No two homes need the same clean. Before your appointment we discuss your property, priorities and any areas needing extra attention, then work from a structured checklist adjusted to suit you.',
      'Our Quality Assurance Process is central to every one-off clean, and where appropriate we use an industrial steam cleaner for a higher level of hygiene and finish.',
    ],
    listTitle: 'What’s included',
    list: ['Kitchen worktops, sinks, splashbacks, hobs and appliance exteriors', 'Bathrooms descaled and sanitised', 'Skirting boards and window sills', 'Mirrors and glass surfaces', 'Floors vacuumed and washed', 'Light switches and door handles', 'Reachable furniture surfaces', 'Steam cleaning where appropriate'],
    tagsTitle: 'Commonly booked for',
    tags: ['Seasonal refreshes', 'Before hosting family or guests', 'Before a sale or handover', 'After a busy period'],
  },
  {
    slug: 'event-cleaning/', name: 'Pre & Post Event Cleaning', short: 'Ready before your guests arrive, restored after they leave.', img: 'dining', img2: 'lounge',
    title: 'Pre & Post Event Cleaning for Private Homes Dublin | Pink Lady',
    desc: 'Event cleaning for private homes in Dublin. We prepare your home before a dinner, celebration or gathering and restore it afterwards.',
    h1: 'Event Cleaning <em>for Private Homes</em>',
    lead: 'Hosting a dinner, a family celebration or a large gathering? We prepare your home beforehand and restore it afterwards.',
    overviewTitle: 'Focus on your <em>guests</em>',
    body: [
      'An occasion at home deserves a home that is ready for it. We prepare every room your guests will see, so you can concentrate on the people and the day itself.',
      'Afterwards, we return and restore your home, so the morning after feels calm rather than daunting.',
      'As with every Pink Lady clean, we agree priorities with you beforehand and work from a checklist tailored to your property and your event.',
    ],
    listTitle: 'Suitable for',
    list: ['Birthdays', 'Communions and confirmations', 'Weddings', 'Holidays and seasonal gatherings', 'Private functions and dinners'],
    tagsTitle: 'Two ways to book',
    tags: ['Before your event', 'After your event', 'Both'],
  },
  {
    slug: 'end-of-tenancy-cleaning/', name: 'Move-In / Move-Out', short: 'Handover-ready, whether you’re arriving or leaving.', img: 'empty', img2: 'stair',
    title: 'Move-In, Move-Out & End of Tenancy Cleaning Dublin | Pink Lady',
    desc: 'Move-in, move-out and end of tenancy cleaning in Dublin for owners, tenants, landlords and property managers. We leave your property spotless and ready.',
    h1: 'Move-In &amp; Move-Out <em>Cleaning</em>',
    lead: 'Arriving in a new home or handing one over, we leave it spotless and ready.',
    overviewTitle: 'Ready for the <em>next chapter</em>',
    body: [
      'Moving is demanding enough. We take care of the clean so the property is ready on the day you need it, whether you are collecting the keys or handing them back.',
      'Every room is cleaned top to bottom from a structured checklist, including the kitchen, bathrooms, skirting, sills, glass, switches and handles.',
      'We bring all products and equipment, and you deal directly with our team from first call to final check.',
    ],
    listTitle: 'Ideal for',
    list: ['Homeowners moving in or out', 'Tenants at the end of a tenancy', 'Landlords between lets', 'Property managers', 'Preparing a home for sale'],
    tagsTitle: 'Includes',
    tags: ['Kitchens', 'Bathrooms', 'Floors', 'Glass & mirrors', 'Skirting & sills'],
  },
  {
    slug: 'after-builders-cleaning/', name: 'After Builders & Renovation', short: 'Fine dust and residue removed from every surface.', img: 'interior', img2: 'kitchen2',
    title: 'After Builders Cleaning Dublin | Renovation Cleaning | Pink Lady',
    desc: 'After builders and post-renovation cleaning in Dublin. Fine dust, residue and marks removed from surfaces, fittings, floors and glass.',
    h1: 'After Builders Cleaning <em>in Dublin</em>',
    lead: 'Renovation dust gets everywhere. We remove it so your newly finished home looks the way it should.',
    overviewTitle: 'See the work <em>at its best</em>',
    body: [
      'After months of planning and building, the final clean is what lets the work shine. Fine dust settles on every surface, inside cupboards and along every ledge.',
      'We remove fine dust, residue and marks from surfaces, fittings, floors and glass, working methodically from top to bottom.',
      'Where appropriate, our industrial steam cleaner provides a higher level of hygiene and finish.',
    ],
    listTitle: 'We attend to',
    list: ['Fine dust on every surface and ledge', 'Residue and marks on fittings', 'Floors vacuumed and washed', 'Glass, mirrors and window sills', 'Kitchens and bathrooms', 'Light switches and door handles'],
    tagsTitle: 'Commonly booked after',
    tags: ['Extensions', 'Kitchen or bathroom refits', 'Full renovations', 'Decorating'],
  },
  {
    slug: 'carpet-cleaning/', name: 'Carpets, Rugs & Upholstery', short: 'Deep cleaning and specialist stain treatment.', img: 'sofa', img2: 'lounge',
    title: 'Carpet & Upholstery Cleaning Dublin | Pink Lady',
    desc: 'Carpet, rug and upholstery cleaning in Dublin. Embedded dirt removed, stains treated, safe eco-friendly products and fast drying times.',
    h1: 'Carpet &amp; Upholstery Cleaning <em>in Dublin</em>',
    lead: 'Carpets and soft furnishings trap dirt, allergens and stains that vacuuming can’t reach.',
    overviewTitle: 'Restored look <em>and feel</em>',
    body: [
      'Our deep cleaning removes embedded dirt, treats stains and restores the look and feel of your carpets, rugs and upholstery.',
      'High-powered equipment lifts embedded dirt, specialist treatments target stains, and safe, eco-friendly products are used throughout. Fast drying times keep disruption to a minimum.',
      'While not every stain can be fully removed, we use the most effective methods available to significantly improve their appearance.',
    ],
    listTitle: 'Stains we treat',
    list: ['Red wine', 'Coffee and food spills', 'Ink and marker', 'Paint and adhesives', 'General wear and heavy traffic marks'],
    tagsTitle: 'Finishing',
    tags: ['Fresh and hygienic', 'Fast drying', 'Final quality check'],
  },
  {
    slug: 'office-cleaning-dublin/', name: 'Office & Commercial', short: 'Professional cleaning scheduled around your working hours.', img: 'office', img2: 'living', minor: true,
    title: 'Office Cleaning Dublin | Commercial Cleaning | Pink Lady',
    desc: 'Office and commercial cleaning in Dublin, scheduled around your working hours. Family-run since 2006.',
    h1: 'Office Cleaning <em>in Dublin</em>',
    lead: 'Professional cleaning for offices and commercial spaces, scheduled around your working hours.',
    overviewTitle: 'Working to <em>your schedule</em>',
    body: [
      'We have cared for a handful of corporate clients since we began in 2006, and bring the same attention to detail to offices that we bring to private homes.',
      'Cleaning is planned around your working hours and follows a structured checklist agreed with you.',
      'You deal directly with our team, and we arrive with all professional products and equipment.',
    ],
    listTitle: 'Includes',
    list: ['Desks and reachable surfaces', 'Kitchens and staff areas', 'Washrooms', 'Floors vacuumed and washed', 'Glass and mirrors', 'Light switches and door handles'],
    tagsTitle: 'Scheduling',
    tags: ['Before or after hours', 'Regular contracts', 'One-off deep cleans'],
  },
];

/* ---------------------------------------------------------------------------
   Layout pieces
--------------------------------------------------------------------------- */
const NAV = [
  { href: '', label: 'Home' },
  { href: 'services/', label: 'Services', sub: true },
  { href: 'our-story/', label: 'Our Story' },
  { href: 'areas-we-serve/', label: 'Areas' },
  { href: 'reviews/', label: 'Reviews' },
  { href: 'get-in-touch/', label: 'Contact' },
];

function head(p, R) {
  const url = SITE_URL + p.path;
  const ld = [orgSchema(), ...(p.schema || [])];
  if (p.crumbs) ld.push(breadcrumbSchema(p));
  return `<!doctype html>
<html lang="en-IE" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${p.title}</title>
<meta name="description" content="${p.desc}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#E0218A">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Pink Lady Cleaning">
<meta property="og:locale" content="en_IE">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}assets/img/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
${p.noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="icon" href="${R}assets/img/favicon-48.png" type="image/png" sizes="48x48">
<link rel="icon" href="${R}assets/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="${R}assets/img/apple-touch-icon.png">
<link rel="manifest" href="${R}site.webmanifest">
<link rel="preload" href="${R}assets/fonts/cormorant-garamond-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${R}assets/fonts/manrope-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="${R}assets/css/style.css">
<script>
  // Runs before paint: enables JS styles and decides whether to play the intro (first visit per session)
  (function (h) {
    h.classList.remove('no-js'); h.classList.add('js');
    var seen = false; try { seen = sessionStorage.getItem('pl-intro'); } catch (e) {}
    if (!seen && !matchMedia('(prefers-reduced-motion: reduce)').matches) h.classList.add('intro-on');
  })(document.documentElement);
</script>
<script src="${R}assets/js/main.js" defer></script>
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : { '@context': 'https://schema.org', '@graph': ld.map(({ '@context': _, ...x }) => x) })}</script>
</head>`;
}

function header(p, R) {
  const L = (h) => R + h || './';
  const cur = (h) => (p.path === h || (h && p.path.startsWith(h)) || (h === 'services/' && p.isService) ? ' aria-current="page"' : '');
  const serviceLinks = SERVICES.map((s) => `<li><a href="${R}${s.slug}">${s.name}<span>→</span></a></li>`).join('');
  const desktop = NAV.map((n) => n.sub
    ? `<li class="has-sub"><a class="menu__link" href="${L(n.href)}"${cur(n.href)}>${n.label} ${ICON.chevron}</a><ul class="submenu" role="list">${serviceLinks}</ul></li>`
    : `<li><a class="menu__link" href="${L(n.href)}"${p.path === n.href ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('');
  let i = 0;
  const mobile = NAV.map((n) => n.sub
    ? `<li><button class="mm-toggle" type="button" aria-expanded="false" style="--i:${i++}">${n.label} ${ICON.plus}</button><div class="mm-sub"><ul><li><a href="${L(n.href)}">All services</a></li>${SERVICES.map((s) => `<li><a href="${R}${s.slug}">${s.name}</a></li>`).join('')}</ul></div></li>`
    : `<li><a href="${L(n.href)}" style="--i:${i++}">${n.label}</a></li>`).join('');
  return `
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="intro" aria-hidden="true">
  <div class="intro__logo">
    <img class="intro__mark" src="${R}assets/img/logo-1206.webp" alt="">
    <img class="intro__word" src="${R}assets/img/logo-1206.webp" alt="">
  </div>
  <div class="intro__bar"></div>
</div>
<div class="progress" aria-hidden="true"></div>
<header class="site-header">
  <div class="topbar">
    <div class="container">
      <p class="sr-only">Contact</p>
      <div class="topbar__links">
        <a href="tel:${BIZ.phoneIntl}">${ICON.phone} ${BIZ.phone}</a>
        <a href="mailto:${BIZ.email}">${ICON.mail} ${BIZ.email}</a>
      </div>
      <span>Family-run · Serving Dublin since 2006</span>
    </div>
  </div>
  <nav class="nav" aria-label="Main">
    <div class="container">
      <a class="brand" href="${L('')}" aria-label="Pink Lady Cleaning, home">
        <picture class="brand__dark"><source srcset="${R}assets/img/logo.webp" type="image/webp"><img src="${R}assets/img/logo.png" alt="Pink Lady — The cleaning company that cares" width="600" height="142"></picture>
        <picture class="brand__light"><source srcset="${R}assets/img/logo-light.webp" type="image/webp"><img src="${R}assets/img/logo-light.png" alt="" width="600" height="142"></picture>
      </a>
      <div class="menu"><ul role="list">${desktop}</ul></div>
      <a class="btn nav__cta" href="${R}free-online-quote/">Request a Quote</a>
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span><span></span></button>
    </div>
  </nav>
</header>
  <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
    <ul class="mobile-menu__main">${mobile}</ul>
    <div class="mobile-menu__foot">
      <a class="btn" href="${R}free-online-quote/">Request a Quote ${ICON.arrow}</a>
      <a class="btn btn--ghost" href="tel:${BIZ.phoneIntl}">Call Margaret · ${BIZ.phone}</a>
      <p>${BIZ.email}</p>
    </div>
  </div>
<main id="main">`;
}

function footer(R) {
  return `
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <picture><source srcset="${R}assets/img/logo-light.webp" type="image/webp"><img src="${R}assets/img/logo-light.png" alt="Pink Lady — The cleaning company that cares" width="600" height="142" loading="lazy"></picture>
        <p>Discreet, meticulous cleaning for Dublin homes. Family-run and trusted since 2006.</p>
      </div>
      <div>
        <h2>Services</h2>
        <ul>${SERVICES.map((s) => `<li><a href="${R}${s.slug}">${s.name}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h2>Pink Lady</h2>
        <ul>
          <li><a href="${R}our-story/">Our Story</a></li>
          <li><a href="${R}areas-we-serve/">Areas We Serve</a></li>
          <li><a href="${R}reviews/">Reviews</a></li>
          <li><a href="${R}free-online-quote/">Request a Quote</a></li>
          <li><a href="${R}get-in-touch/">Contact</a></li>
        </ul>
        <!-- TODO: confirm with client — add social links (Instagram / Facebook / Google Business Profile) here -->
      </div>
      <div>
        <h2>Contact</h2>
        <address>${BIZ.legal}<br>${BIZ.street}<br>${BIZ.locality}, ${BIZ.region}<br>${BIZ.country}</address>
        <ul style="margin-top:16px">
          <li><a href="tel:${BIZ.phoneIntl}">Margaret · ${BIZ.phone}</a></li>
          <li><a href="mailto:${BIZ.email}">${BIZ.email}</a></li>
        </ul>
      </div>
    </div>
    <p class="footer__big" data-reveal>The cleaning company <em>that cares.</em></p>
    <div class="footer__bottom">
      <p>© <span data-year>2026</span> ${BIZ.legal}. All rights reserved.</p>
      <ul role="list">
        <li><a href="${R}privacy-policy/">Privacy Policy</a></li>
        <li><a href="${R}terms/">Terms</a></li>
      </ul>
    </div>
  </div>
</footer>
<nav class="action-bar" aria-label="Quick contact">
  <a href="tel:${BIZ.phoneIntl}">${ICON.phone} Call</a>
  <a href="${BIZ.whatsapp}" target="_blank" rel="noopener">${ICON.whatsapp} WhatsApp</a>
  <a class="is-primary" href="${R}free-online-quote/">Get a Quote</a>
</nav>
</body>
</html>
`;
}

/* ---------------------------------------------------------------------------
   Schema
--------------------------------------------------------------------------- */
function orgSchema() {
  return {
    '@context': 'https://schema.org',
    // schema.org has no "CleaningService" type; HomeAndConstructionBusiness is the closest LocalBusiness subtype.
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': SITE_URL + '#business',
    name: BIZ.name,
    legalName: BIZ.legal,
    slogan: 'The cleaning company that cares',
    description: 'Discreet, meticulous cleaning for high-value homes across Dublin. Family-run since 2006.',
    url: SITE_URL,
    logo: SITE_URL + 'assets/img/logo.png',
    image: SITE_URL + 'assets/img/og-image.jpg',
    telephone: BIZ.phoneDisplayIntl,
    email: BIZ.email,
    foundingDate: '2006',
    address: { '@type': 'PostalAddress', streetAddress: BIZ.street, addressLocality: BIZ.locality, addressRegion: 'Dublin', postalCode: 'D13', addressCountry: 'IE' },
    areaServed: AREAS.map((a) => ({ '@type': 'Place', name: a + ', Dublin' })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Cleaning services',
      itemListElement: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, serviceType: 'Cleaning service', url: SITE_URL + s.slug } })),
    },
  };
}
function serviceSchema(s) {
  return {
    '@context': 'https://schema.org', '@type': 'Service', name: s.name, serviceType: 'Cleaning service',
    description: s.desc, url: SITE_URL + s.slug, provider: { '@id': SITE_URL + '#business' },
    areaServed: { '@type': 'City', name: 'Dublin' },
  };
}
function breadcrumbSchema(p) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '' }, ...p.crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE_URL + c.path })),
  };
}


/* Decorative twinkling sparkles + soft pink glow (pure CSS animation, hidden from screen readers) */
function sparkles(n = 14, seed = 1, cls = '') {
  let x = seed * 9301 + 49297;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  let out = '';
  for (let i = 0; i < n; i++) {
    out += `<i style="left:${(rnd() * 96 + 2).toFixed(1)}%;top:${(rnd() * 90 + 4).toFixed(1)}%;font-size:${(8 + rnd() * 18).toFixed(0)}px;animation-delay:${(-rnd() * 5).toFixed(2)}s;animation-duration:${(3.5 + rnd() * 3).toFixed(1)}s"></i>`;
  }
  return `<div class="sparkles${cls ? ' ' + cls : ''}" aria-hidden="true">${out}</div>`;
}
const glow = () => '<div class="glow" aria-hidden="true"><span></span><span></span><span></span></div>';

/* ---------------------------------------------------------------------------
   Components
--------------------------------------------------------------------------- */
const crumbsHtml = (p, R) => p.crumbs ? `<nav class="crumbs" aria-label="Breadcrumb" data-reveal="fade"><a href="${R || './'}">Home</a>${p.crumbs.map((c, i) => `<span aria-hidden="true">/</span>${i === p.crumbs.length - 1 ? `<span aria-current="page">${c.name}</span>` : `<a href="${R}${c.path}">${c.name}</a>`}`).join('')}</nav>` : '';

function pageHero(p, R, { eyebrow, title, lead, image, short = false, ctas = true }) {
  return `
<section class="page-hero${short ? ' page-hero--short' : ''}">
  <div class="hero__media"><div class="media">${img(image, { eager: true })}</div></div>
  ${glow()}${sparkles(12, image.length)}
  <div class="container">
    ${crumbsHtml(p, R)}
    ${eyebrow ? `<p class="eyebrow" data-reveal="fade" style="--d:100">${eyebrow}</p>` : ''}
    <h1 class="h1" data-split style="max-width:16ch">${title}</h1>
    ${lead ? `<p class="lead" data-reveal style="--d:450">${lead}</p>` : ''}
    ${ctas ? `<div class="btn-row" data-reveal style="--d:600;margin-top:32px"><a class="btn" href="${R}free-online-quote/">Request a Quote ${ICON.arrow}</a><a class="btn btn--light" href="tel:${BIZ.phoneIntl}">Call Margaret</a></div>` : ''}
  </div>
</section>`;
}

function sectionHead({ eyebrow, title, lead, center = false }) {
  return `<div class="section-head${center ? ' text-center' : ''}">
    <p class="eyebrow${center ? ' eyebrow--center' : ''}" data-reveal="fade">${eyebrow}</p>
    <h2 class="h2" data-split>${title}</h2>
    ${lead ? `<p class="lead" data-reveal style="--d:200">${lead}</p>` : ''}
  </div>`;
}

function serviceCards(list, R, { numbered = true } = {}) {
  return `<div class="cards">${list.map((s, i) => `
    <a class="card" href="${R}${s.slug}" data-reveal style="--d:${(i % 3) * 120}">
      <div class="media" data-reveal="clip" style="--d:${(i % 3) * 120}">${numbered ? `<span class="card__num">${String(i + 1).padStart(2, '0')}</span>` : ''}${img(s.img, { sizes: '(min-width:1000px) 33vw, (min-width:640px) 50vw, 100vw', widths: [480, 720, 1000] })}</div>
      <h3>${s.name}</h3>
      <p>${s.short}</p>
      <span class="link-arrow">Discover ${ICON.next}</span>
    </a>`).join('')}
  </div>`;
}

const STEPS = [
  ['Consultation', 'We discuss your home, its finishes and anything needing special attention.'],
  ['Tailored checklist', 'A structured plan built for your property, not a generic package.'],
  ['A trusted team', 'Experienced, vetted cleaners who arrive fully equipped.<!-- TODO: confirm with client — "the same team each visit" (CLIENT_QUESTIONS.md #4) -->'],
  ['Final check', 'Every clean finishes with a quality check against your checklist.'],
];
function standard({ blush = false, compact = false } = {}) {
  return `
<section class="section${blush ? ' section--blush' : ''}" id="standard">
  <div class="container">
    ${sectionHead({ eyebrow: 'The Pink Lady Standard', title: compact ? 'How we <em>work</em>' : 'Four steps to a home <em>cared for properly</em>', lead: compact ? '' : 'Every home is different. Our process makes sure the care it receives is too.' })}
    <ol class="process" role="list">
      <li class="process__track" aria-hidden="true"><span class="process__fill"></span></li>
      ${STEPS.map(([t, d], i) => `<li class="step" data-reveal style="--d:${i * 140}"><span class="step__dot">${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}
    </ol>
  </div>
</section>`;
}

function ctaBand(R, { title = 'Let’s talk about <em>your home.</em>', lead = 'Tell us about your property and we’ll put together a tailored quote.', image = 'villa' } = {}) {
  return `
<section class="section cta-band">
  <div class="media" aria-hidden="true">${img(image, { parallax: '0.12', widths: [800, 1400, 2000] })}</div>
  ${sparkles(16, 3)}
  <div class="container container--narrow">
    <p class="eyebrow eyebrow--center" data-reveal="fade">Request a Quote</p>
    <h2 class="h2" data-split>${title}</h2>
    <p class="lead" data-reveal style="--d:250">${lead}</p>
    <div class="btn-row" data-reveal style="--d:400">
      <a class="btn btn--ivory" href="${R}free-online-quote/">Request a Quote ${ICON.arrow}</a>
      <a class="btn btn--light" href="tel:${BIZ.phoneIntl}">${BIZ.phone}</a>
    </div>
  </div>
</section>`;
}

function reviewBlock(R) {
  return `
<div class="carousel" aria-roledescription="carousel" aria-label="Client reviews">
  <div class="carousel__track">
    <!-- TODO: confirm with client — add further real Google reviews as extra .carousel__slide items (copy the block below). Arrows appear automatically once there are two or more. Never invent quotes. -->
    <figure class="carousel__slide review is-current" aria-roledescription="slide">
      <span class="review__mark" aria-hidden="true">“</span>
      <div class="stars" role="img" aria-label="5 out of 5 stars" data-stagger>${ICON.star.repeat(5)}</div>
      <blockquote><p>Great cleaning job on Saturday. Will make it a regular once a year — must do.</p></blockquote>
      <figcaption><cite>Aine Pitt <span>· Google review</span></cite></figcaption>
    </figure>
  </div>
  <div class="carousel__nav"><button type="button" data-prev aria-label="Previous review">${ICON.prev}</button><button type="button" data-next aria-label="Next review">${ICON.next}</button></div>
</div>`;
}

function marquee() {
  const items = AREAS.map((a) => `<li>${a}</li>`).join('');
  return `<div class="marquee" aria-hidden="true"><div class="marquee__inner"><ul>${items}</ul><ul>${items}</ul></div></div>`;
}

const checklist = (items, two = false) => `<ul class="checklist${two ? ' checklist--2' : ''}" role="list">${items.map((t) => `<li>${ICON.check}<span>${t}</span></li>`).join('')}</ul>`;

/* ---------------------------------------------------------------------------
   Pages
--------------------------------------------------------------------------- */
const pages = [];

// ---------- Home ----------
pages.push({
  path: '', darkHero: true,
  title: 'Luxury Home Cleaning Dublin | Pink Lady Cleaning Since 2006',
  desc: 'Discreet, meticulous cleaning for Dublin’s finest homes. Family-run since 2006, with a vetted, experienced team and tailored cleaning checklists.',
  body: (p, R) => `
<section class="hero">
  <div class="hero__media" data-parallax="0.25"><div class="media">${img('hero', { eager: true })}</div></div>
  ${glow()}${sparkles(22, 7)}
  <div class="container hero__inner">
    <p class="eyebrow" data-reveal="fade" style="--d:100">Family-run · Dublin · Since 2006</p>
    <h1 class="display hero__title" data-split style="--d:150">Exceptional care for <em>exceptional</em> homes</h1>
    <div class="hero__bottom">
      <div>
        <p class="hero__sub" data-reveal style="--d:700">Discreet, meticulous cleaning for Dublin’s finest homes, trusted since 2006.</p>
        <div class="btn-row" data-reveal style="--d:850">
          <a class="btn" href="${R}free-online-quote/">Request a Quote ${ICON.arrow}</a>
          <a class="btn btn--light" href="tel:${BIZ.phoneIntl}">Call Margaret</a>
        </div>
      </div>
      <a class="scroll-cue" href="#intro" data-reveal="fade" style="--d:1200"><span class="scroll-cue__line"></span> Scroll</a>
    </div>
  </div>
</section>

<section class="trust" aria-label="Why clients choose us">
  <div class="container">
    <ul role="list" data-stagger>
      <li>${ICON.calendar} Since 2006</li>
      <li>${ICON.family} Family-run</li>
      <li>${ICON.shield} Vetted, experienced team</li>
      <li>${ICON.pin} Dublin-wide</li>
      <!-- TODO: confirm with client — "Fully insured" (CLIENT_QUESTIONS.md #1) -->
    </ul>
  </div>
</section>

<section class="section" id="intro">
  <div class="container grid-2">
    <div>
      <p class="eyebrow" data-reveal="fade">Welcome to Pink Lady</p>
      <h2 class="h2" data-split>A beautiful home deserves more than <em>a standard clean.</em></h2>
      <span class="gold-rule" data-reveal="line"></span>
      <p class="lead" data-reveal>For almost two decades, Pink Lady has cared for Dublin homes with the attention to detail, discretion and consistency that high-value properties demand.</p>
      <p data-reveal style="--d:120">From penthouses to period residences and large family homes, every clean is planned around your property — its finishes, its rhythms and your priorities. You deal directly with our team, never a call centre.</p>
      <div class="years" data-reveal style="--d:200"><span class="years__num" data-years>20</span><span class="years__label">Years caring for Dublin homes</span></div>
    </div>
    <div class="img-stack">
      <div class="media ratio-portrait" data-reveal="clip">${img('stair', { sizes: '(min-width:900px) 45vw, 100vw', widths: [600, 900, 1300], parallax: '0.05' })}</div>
      <div class="media ratio-square img-stack__small" data-reveal="clip" style="--d:300">${img('bathroom', { sizes: '(min-width:900px) 22vw, 46vw', widths: [400, 600, 800] })}</div>
    </div>
  </div>
</section>

<section class="section section--ivory2">
  <div class="container">
    <div class="grid-2 grid-2--wide-left" style="align-items:end;margin-bottom:clamp(48px,6vw,80px)">
      <div>
        <p class="eyebrow" data-reveal="fade">Our Services</p>
        <h2 class="h2" data-split style="margin:0">Care for every part of <em>your home</em></h2>
      </div>
      <div data-reveal style="--d:200"><p class="lead" style="margin-bottom:20px">Regular housekeeping, one-off deep cleans and specialist care, each tailored to your property.</p><a class="link-arrow" href="${R}services/">All services ${ICON.next}</a></div>
    </div>
    ${serviceCards(SERVICES.filter((s) => !s.minor), R)}
  </div>
</section>

${standard()}

<section class="section section--dark">
  ${sparkles(12, 5)}
  <div class="container grid-2">
    <div class="media ratio-portrait" data-reveal="clip">${img('interior', { sizes: '(min-width:900px) 45vw, 100vw', widths: [600, 900, 1300], parallax: '0.05' })}</div>
    <div>
      <p class="eyebrow" data-reveal="fade">Discretion &amp; Trust</p>
      <h2 class="h2" data-split>Letting someone into your home <em>is personal.</em></h2>
      <p class="lead" data-reveal>Our team works quietly and respectfully around your household, with the care that fine homes require.</p>
      <div class="features" data-stagger style="margin-top:32px">
        <div class="feature">${ICON.shield}<div><h3>Rigorously vetted</h3><p>Every Pink Lady cleaner goes through a rigorous vetting process.</p></div></div>
        <!-- TODO: confirm with client — Garda vetting / confidentiality agreements / key-holding and alarm codes (CLIENT_QUESTIONS.md #2, #3, #6). Add a .feature for each once confirmed. -->
        <div class="feature">${ICON.gem}<div><h3>Care for fine finishes</h3><p>Marble, natural stone, hardwood, high-gloss joinery and designer fixtures each need the right approach. We use professional products and equipment suited to the surface.<!-- TODO: confirm with client which surfaces (CLIENT_QUESTIONS.md #5) --></p></div></div>
        <div class="feature">${ICON.spray}<div><h3>Fully equipped</h3><p>We bring all our own professional products and equipment, including an industrial steam cleaner where appropriate.</p></div></div>
        <div class="feature">${ICON.chat}<div><h3>A personal service</h3><p>You deal directly with our family-run team, never a call centre or automated booking system.</p></div></div>
      </div>
    </div>
  </div>
</section>

<section class="section section--blush">
  <div class="container">
    ${sectionHead({ eyebrow: 'Reviews', title: 'Trusted by Dublin <em>homeowners</em>', center: true })}
    <div data-reveal="scale">${reviewBlock(R)}</div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    ${sectionHead({ eyebrow: 'Areas', title: 'Serving homes across <em>Dublin</em>', lead: 'Elsewhere in Dublin? Get in touch to check availability.', center: true })}
  </div>
  <div data-reveal="fade">${marquee()}</div>
  <div class="container text-center" style="margin-top:40px" data-reveal><a class="link-arrow" href="${R}areas-we-serve/">See all areas ${ICON.next}</a></div>
</section>

${ctaBand(R)}`,
});

// ---------- Services overview ----------
pages.push({
  path: 'services/', darkHero: true, crumbs: [{ name: 'Services', path: 'services/' }],
  title: 'Cleaning Services Dublin | Luxury, Deep & Specialist Cleaning | Pink Lady',
  desc: 'Luxury home cleaning, deep cleaning, event, move-in/move-out, after builders, carpet and office cleaning across Dublin. Family-run since 2006.',
  body: (p, R) => `
${pageHero(p, R, { eyebrow: 'Our Services', title: 'Care for every part <em>of your home</em>', lead: 'From regular housekeeping to one-off deep cleans and specialist care, every service is tailored to your property.', image: 'dining' })}
<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: 'For your home', title: 'Residential <em>services</em>', lead: 'Each service begins with a conversation about your home and follows a checklist built around it.' })}
    ${serviceCards(SERVICES.filter((s) => !s.minor), R)}
  </div>
</section>
<section class="section section--ivory2 section--tight">
  <div class="container grid-2">
    <div>
      <p class="eyebrow" data-reveal="fade">Also available</p>
      <h2 class="h2" data-split>Office &amp; <em>commercial</em></h2>
      <p class="lead" data-reveal>Professional cleaning for offices and commercial spaces, scheduled around your working hours.</p>
      <a class="link-arrow" href="${R}office-cleaning-dublin/" data-reveal>Office cleaning ${ICON.next}</a>
    </div>
    <div class="media ratio-land" data-reveal="clip">${img('office', { sizes: '(min-width:900px) 45vw, 100vw', widths: [600, 900, 1300] })}</div>
  </div>
</section>
${standard({ compact: true })}
${ctaBand(R)}`,
});

// ---------- Service pages ----------
SERVICES.forEach((s) => {
  const others = SERVICES.filter((o) => o !== s && !o.minor).slice(0, 3);
  pages.push({
    path: s.slug, darkHero: true, isService: true, title: s.title, desc: s.desc,
    crumbs: [{ name: 'Services', path: 'services/' }, { name: s.name, path: s.slug }],
    schema: [serviceSchema(s)],
    body: (p, R) => `
${pageHero(p, R, { eyebrow: s.name, title: s.h1, lead: s.lead, image: s.img })}
<section class="section">
  <div class="container grid-2">
    <div>
      <p class="eyebrow" data-reveal="fade">Overview</p>
      <h2 class="h2" data-split>${s.overviewTitle}</h2>
      <span class="gold-rule" data-reveal="line"></span>
      ${s.body.map((t, i) => `<p${i === 0 ? ' class="lead"' : ''} data-reveal style="--d:${i * 100}">${t}</p>`).join('')}
    </div>
    <div class="img-stack">
      <div class="media ratio-portrait" data-reveal="clip">${img(s.img2, { sizes: '(min-width:900px) 45vw, 100vw', widths: [600, 900, 1300], parallax: '0.05' })}</div>
    </div>
  </div>
</section>
<section class="section section--blush">
  <div class="container grid-2" style="align-items:start">
    <div>
      <p class="eyebrow" data-reveal="fade">${s.name}</p>
      <h2 class="h2" data-split>${s.listTitle}</h2>
      <div data-reveal style="--d:200;margin-top:36px">
        <h3 class="h3" style="font-size:1.3rem">${s.tagsTitle}</h3>
        <ul class="tag-list" role="list" data-stagger>${s.tags.map((t) => `<li>${t}</li>`).join('')}</ul>
      </div>
    </div>
    <div data-reveal style="--d:150">${checklist(s.list)}</div>
  </div>
</section>
${standard({ compact: true })}
<section class="section section--ivory2">
  <div class="container">
    ${sectionHead({ eyebrow: 'Explore', title: 'Other <em>services</em>' })}
    ${serviceCards(others, R, { numbered: false })}
  </div>
</section>
${ctaBand(R, { image: s.img2 })}`,
  });
});

// ---------- Our story ----------
pages.push({
  path: 'our-story/', darkHero: true, crumbs: [{ name: 'Our Story', path: 'our-story/' }],
  title: 'About Pink Lady Cleaning | Family-Run Since 2006',
  desc: 'Pink Lady was founded in Dublin in 2006 with a simple idea: a cleaning company that delivers an excellent service and genuinely listens to its clients.',
  body: (p, R) => `
${pageHero(p, R, { eyebrow: 'Our Story', title: 'Family-run, <em>since 2006</em>', lead: 'A cleaning company that delivers an excellent service and genuinely listens to its clients.', image: 'lounge', ctas: false })}
<section class="section">
  <div class="container grid-2">
    <div class="img-stack">
      <div class="media ratio-portrait" data-reveal="clip">${img('living', { sizes: '(min-width:900px) 45vw, 100vw', widths: [600, 900, 1300], parallax: '0.05' })}</div>
      <div class="img-caption" data-reveal style="--d:500"><strong>2006</strong><span>Founded in Dublin</span></div>
    </div>
    <div>
      <p class="eyebrow" data-reveal="fade">Where we began</p>
      <h2 class="h2" data-split>A simple idea, <em>done properly</em></h2>
      <span class="gold-rule" data-reveal="line"></span>
      <p class="lead" data-reveal>Pink Lady was founded in 2006 with a simple idea: a cleaning company that delivers an excellent service and genuinely listens to its clients.</p>
      <p data-reveal>We started with a small group of clients in North Dublin — working mothers, busy professionals and a handful of corporate clients — and grew by doing exactly what we promised, every time.</p>
      <p data-reveal>From day one we have worked in partnership with our clients, not just listening to what they need but building it into how we work.</p>
    </div>
  </div>
</section>
<section class="section section--dark">
  ${sparkles(12, 5)}
  <div class="container grid-2">
    <div>
      <p class="eyebrow" data-reveal="fade">Today</p>
      <h2 class="h2" data-split>Still family-run. <em>Still personal.</em></h2>
      <p class="lead" data-reveal>Today we care for homes across Dublin, from family houses to penthouses and large private residences.</p>
      <p data-reveal>We’re still family-run, still personal, and still led by Margaret. You’ll always deal directly with us.</p>
      <div class="years" data-reveal><span class="years__num" data-years style="color:#F2B8D2">20</span><span class="years__label" style="color:rgba(250,247,243,.7)">Years caring for Dublin homes</span></div>
    </div>
    <div class="features" data-stagger>
      <div class="feature">${ICON.family}<div><h3>Family-run</h3><p>A Dublin business, led by Margaret since the beginning.</p></div></div>
      <div class="feature">${ICON.shield}<div><h3>Vetted and experienced</h3><p>Every cleaner undergoes a rigorous vetting process.</p></div></div>
      <div class="feature">${ICON.check.replace('stroke-width="1.6"', 'stroke-width="1.3"')}<div><h3>Tailored checklists</h3><p>Every home cleaned to a plan built around it.</p></div></div>
      <div class="feature">${ICON.chat}<div><h3>Direct contact</h3><p>No call centre, no automated booking. Just our team.</p></div></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="container container--narrow text-center">
    <span class="review__mark" aria-hidden="true" data-reveal="fade">“</span>
    <p class="h2" data-split style="font-style:italic">The cleaning company <em>that cares.</em></p>
  </div>
</section>
${standard({ blush: true, compact: true })}
${ctaBand(R)}`,
});

// ---------- Areas ----------
pages.push({
  path: 'areas-we-serve/', darkHero: true, crumbs: [{ name: 'Areas We Serve', path: 'areas-we-serve/' }],
  title: 'Areas We Serve | Home Cleaning Across Dublin | Pink Lady',
  desc: 'Pink Lady cleans homes across Dublin, including Ranelagh, Rathmines, Ballsbridge, Dundrum, Blackrock, Clontarf, Malahide and Swords.',
  body: (p, R) => `
${pageHero(p, R, { eyebrow: 'Areas We Serve', title: 'Serving homes <em>across Dublin</em>', lead: 'Because we work locally, we can offer a more responsive and personal service than larger national providers.', image: 'exterior', short: true, ctas: false })}
<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: 'Where we work', title: 'Our <em>areas</em>', lead: 'If you are based elsewhere in Dublin, simply contact us to check availability.' })}
    <!-- TODO: confirm with client — possible additions: Howth, Sutton, Dalkey, Killiney, Foxrock, Donnybrook, Castleknock, Portmarnock, Wicklow/Kildare estates (CLIENT_QUESTIONS.md #14) -->
    <ul class="areas-grid" role="list" data-stagger>${AREAS.map((a) => `<li>${a}</li>`).join('')}</ul>
  </div>
</section>
<div data-reveal="fade" style="padding-bottom:clamp(80px,10vw,140px)">${marquee()}</div>
${ctaBand(R, { title: 'Elsewhere in <em>Dublin?</em>', lead: 'Get in touch to check availability for your area.' })}`,
});

// ---------- Reviews ----------
pages.push({
  path: 'reviews/', darkHero: true, crumbs: [{ name: 'Reviews', path: 'reviews/' }],
  title: 'Reviews | Pink Lady Cleaning Dublin',
  desc: 'What clients say about Pink Lady Cleaning, the family-run Dublin cleaning company trusted since 2006.',
  body: (p, R) => `
${pageHero(p, R, { eyebrow: 'Reviews', title: 'Trusted by Dublin <em>homeowners</em>', image: 'bedroom', short: true, ctas: false })}
<section class="section section--blush">
  <div class="container">
    <div data-reveal="scale">${reviewBlock(R)}</div>
    <div class="text-center" style="margin-top:56px" data-reveal>
      <!-- TODO: confirm with client — replace with the direct Google Business Profile reviews link -->
      <a class="btn btn--ghost" href="https://www.google.com/search?q=Pink+Lady+Cleaning+Services+Baldoyle+Dublin" target="_blank" rel="noopener">Read our reviews on Google ${ICON.arrow}</a>
    </div>
  </div>
</section>
${ctaBand(R)}`,
});

// ---------- Quote ----------
const quoteForm = (R) => `
<div class="form-card" data-reveal>
  <!-- TODO: form endpoint — create a free access key at https://web3forms.com (sent to info@pinklady.ie) and paste it into the access_key value below. Same on the contact page. -->
  <form class="form" action="https://api.web3forms.com/submit" method="POST" data-ajax novalidate>
    <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY">
    <input type="hidden" name="subject" value="New quote request — pinklady.ie">
    <input type="hidden" name="from_name" value="pinklady.ie">
    <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="form__row form__row--2">
      <div class="field"><label for="q-name">Name <span class="req">*</span></label><input id="q-name" name="name" autocomplete="name" required><span class="field__line"></span></div>
      <div class="field"><label for="q-phone">Phone <span class="req">*</span></label><input id="q-phone" name="phone" type="tel" autocomplete="tel" required><span class="field__line"></span></div>
    </div>
    <div class="field"><label for="q-email">Email <span class="req">*</span></label><input id="q-email" name="email" type="email" autocomplete="email" required><span class="field__line"></span></div>
    <div class="form__row form__row--2">
      <div class="field"><label for="q-type">Property type</label>
        <select id="q-type" name="property_type"><option value="">Please select</option><option>House</option><option>Penthouse</option><option>Apartment</option><option>Estate</option><option>Office</option></select><span class="field__line"></span></div>
      <div class="field"><label for="q-size">Approx. size</label><input id="q-size" name="size" placeholder="e.g. 5 bedrooms or 4,000 sq ft"><span class="field__line"></span></div>
    </div>
    <div class="field"><label for="q-area">Area</label><input id="q-area" name="area" list="areas" autocomplete="address-level2" placeholder="e.g. Ballsbridge"><datalist id="areas">${AREAS.map((a) => `<option value="${a}">`).join('')}</datalist><span class="field__line"></span></div>
    <fieldset class="field"><legend>Service needed</legend>
      <div class="chips">${SERVICES.map((s) => `<label class="chip"><input type="checkbox" name="service" value="${s.name}"><span>${s.name}</span></label>`).join('')}</div>
    </fieldset>
    <fieldset class="field"><legend>One-off or regular</legend>
      <div class="chips">${['One-off', 'Regular', 'Not sure yet'].map((o) => `<label class="chip"><input type="radio" name="frequency" value="${o}"><span>${o}</span></label>`).join('')}</div>
    </fieldset>
    <div class="field" style="max-width:320px"><label for="q-date">Preferred date</label><input id="q-date" name="preferred_date" type="date"><span class="field__line"></span></div>
    <div class="field"><label for="q-msg">Message</label><textarea id="q-msg" name="message" placeholder="Anything we should know about your home, its finishes or access"></textarea><span class="field__line"></span></div>
    <label class="consent"><input type="checkbox" name="consent" value="yes" required><span>I agree to Pink Lady contacting me about this enquiry and to my details being handled as described in the <a href="${R}privacy-policy/">Privacy Policy</a>. <span class="req">*</span></span></label>
    <div><button class="btn" type="submit">Send my request ${ICON.arrow}</button></div>
    <p class="form__status" role="status" aria-live="polite"></p>
  </form>
  <div class="form-success" role="status">
    <svg viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="36" cy="36" r="30"/><path d="m24 37 8 8 16-17"/></svg>
    <h2 class="h3">Thank you</h2>
    <p class="lead" style="margin-inline:auto">Your request has been sent. We’ll be in touch with a tailored quote soon.</p>
  </div>
</div>`;

pages.push({
  path: 'free-online-quote/', darkHero: true, crumbs: [{ name: 'Request a Quote', path: 'free-online-quote/' }],
  title: 'Request a Cleaning Quote | Pink Lady Dublin',
  desc: 'Tell us about your home and what you need. Pink Lady will come back to you with a tailored cleaning quote. Or call Margaret on 086 165 5300.',
  body: (p, R) => `
${pageHero(p, R, { eyebrow: 'Request a Quote', title: 'Tell us about <em>your home</em>', lead: 'We’ll come back to you with a tailored quote.<!-- TODO: confirm with client — typical response time, e.g. "usually within 24 hours" -->', image: 'kitchen', short: true, ctas: false })}
<section class="section">
  <div class="container grid-2" style="align-items:start">
    <div style="position:sticky;top:120px">
      <p class="eyebrow" data-reveal="fade">What happens next</p>
      <h2 class="h2" data-split>A quote built <em>around you</em></h2>
      <ol class="process" role="list" style="margin-top:40px;grid-template-columns:1fr">
        <li class="process__track" aria-hidden="true" style="left:23px;right:auto;top:24px;bottom:24px;width:1px;height:auto"><span class="process__fill" style="transform:scaleY(var(--progress,0));transform-origin:top"></span></li>
        <li class="step" data-reveal style="padding:0 0 40px 80px"><span class="step__dot">1</span><h3>We review your request</h3><p>Every enquiry is read personally by our team.</p></li>
        <li class="step" data-reveal style="padding:0 0 40px 80px;--d:120"><span class="step__dot">2</span><h3>We talk about your home</h3><p>Its finishes, priorities and anything needing special attention.</p></li>
        <li class="step" data-reveal style="padding:0 0 0 80px;--d:240"><span class="step__dot">3</span><h3>Your tailored quote</h3><p>Clear and built around your property.</p></li>
      </ol>
      <p data-reveal style="margin-top:40px">Prefer to talk? Call Margaret on <a href="tel:${BIZ.phoneIntl}" style="text-decoration:underline;text-underline-offset:3px">${BIZ.phone}</a>.</p>
    </div>
    ${quoteForm(R)}
  </div>
</section>`,
});

// ---------- Contact ----------
pages.push({
  path: 'get-in-touch/', darkHero: true, crumbs: [{ name: 'Contact', path: 'get-in-touch/' }],
  title: 'Contact Pink Lady Cleaning | Baldoyle, Dublin 13',
  desc: 'Contact Pink Lady Cleaning. Call Margaret on 086 165 5300, email info@pinklady.ie or send us a message.',
  body: (p, R) => `
${pageHero(p, R, { eyebrow: 'Contact', title: 'We’d be glad to <em>hear from you</em>', lead: 'You’ll always deal directly with our team.', image: 'hero', short: true, ctas: false })}
<section class="section">
  <div class="container grid-2" style="align-items:start">
    <div>
      <ul class="contact-list" role="list" data-stagger>
        <li><span>Call Margaret</span><a href="tel:${BIZ.phoneIntl}">${BIZ.phone}</a></li>
        <li><span>WhatsApp</span><a href="${BIZ.whatsapp}" target="_blank" rel="noopener">Message us</a></li>
        <li><span>Email</span><a href="mailto:${BIZ.email}">${BIZ.email}</a></li>
        <li><span>Address</span><address>${BIZ.legal}<br>${BIZ.street}, ${BIZ.locality}<br>${BIZ.region}, ${BIZ.country}</address></li>
        <!-- TODO: confirm with client — opening hours / weekend availability (CLIENT_QUESTIONS.md #11) -->
      </ul>
      <div class="media" data-reveal="clip" style="margin-top:40px;background:var(--ivory-2)">
        <iframe class="map-frame" title="Map showing Pink Lady Cleaning, Baldoyle, Dublin 13" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=11+Moyclare+Avenue,+Baldoyle,+Dublin+13,+Ireland&output=embed"></iframe>
      </div>
    </div>
    <div class="form-card" data-reveal style="--d:150">
      <h2 class="h3" style="margin-bottom:28px">Send a message</h2>
      <!-- TODO: form endpoint — paste the same Web3Forms access key used on the quote page -->
      <form class="form" action="https://api.web3forms.com/submit" method="POST" data-ajax novalidate>
        <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY">
        <input type="hidden" name="subject" value="New message — pinklady.ie">
        <input type="hidden" name="from_name" value="pinklady.ie">
        <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="field"><label for="c-name">Name <span class="req">*</span></label><input id="c-name" name="name" autocomplete="name" required><span class="field__line"></span></div>
        <div class="form__row form__row--2">
          <div class="field"><label for="c-email">Email <span class="req">*</span></label><input id="c-email" name="email" type="email" autocomplete="email" required><span class="field__line"></span></div>
          <div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" autocomplete="tel"><span class="field__line"></span></div>
        </div>
        <div class="field"><label for="c-msg">Message <span class="req">*</span></label><textarea id="c-msg" name="message" required></textarea><span class="field__line"></span></div>
        <label class="consent"><input type="checkbox" name="consent" value="yes" required><span>I agree to my details being handled as described in the <a href="${R}privacy-policy/">Privacy Policy</a>. <span class="req">*</span></span></label>
        <div><button class="btn" type="submit">Send message ${ICON.arrow}</button></div>
        <p class="form__status" role="status" aria-live="polite"></p>
      </form>
      <div class="form-success" role="status">
        <svg viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="36" cy="36" r="30"/><path d="m24 37 8 8 16-17"/></svg>
        <h2 class="h3">Thank you</h2>
        <p class="lead" style="margin-inline:auto">Your message has been sent. We’ll be in touch soon.</p>
      </div>
    </div>
  </div>
</section>`,
});

// ---------- Legal ----------
const legal = (path, name, title, desc, html) => pages.push({
  path, crumbs: [{ name, path }], title, desc,
  body: (p, R) => `
<section class="plain-head">
  <div class="container container--narrow">
    ${crumbsHtml(p, R)}
    <h1 class="h1" data-split>${name}</h1>
    <p class="lead" data-reveal>Last updated: <!-- TODO: set date when approved -->September 2026</p>
  </div>
</section>
<section class="section section--tight">
  <div class="container container--narrow prose" data-reveal>
    <!-- TODO: confirm with client — have this reviewed before launch. It is a plain-English starting point, not legal advice. -->
    ${html(R)}
  </div>
</section>`,
});

legal('privacy-policy/', 'Privacy Policy', 'Privacy Policy | Pink Lady Cleaning', 'How Pink Lady Cleaning Services Ltd collects, uses and protects your personal data.', (R) => `
<p>${BIZ.legal} (“Pink Lady”, “we”, “us”) is committed to safeguarding your privacy and ensuring your data is collected, stored and destroyed in compliance with all relevant laws and regulations, including the EU General Data Protection Regulation (GDPR) and the Irish Data Protection Acts 1988–2018.</p>
<h2>Who we are</h2>
<p>${BIZ.legal}, ${BIZ.street}, ${BIZ.locality}, ${BIZ.region}, ${BIZ.country}. You can contact us about your data at <a href="mailto:${BIZ.email}">${BIZ.email}</a> or on ${BIZ.phone}.</p>
<h2>What we collect</h2>
<p>When you request a quote or send us a message, we collect the details you choose to give us: your name, email address, phone number, information about your property (type, approximate size and area), the services you are interested in, your preferred date and any message you include.</p>
<p>When you become a client, we may also hold your address, access instructions and invoicing details so we can provide our service.</p>
<h2>How we use it</h2>
<ul>
  <li>To respond to your enquiry and prepare a quote (legal basis: steps prior to entering a contract, at your request).</li>
  <li>To provide, schedule and invoice our cleaning services (legal basis: performance of a contract).</li>
  <li>To meet our legal and accounting obligations (legal basis: legal obligation).</li>
</ul>
<p>We do not sell your data and we do not use it for marketing without your separate consent.</p>
<h2>Who we share it with</h2>
<p>Enquiries sent through this website are delivered to our inbox by a form-processing service (Web3Forms), acting as our processor. <!-- TODO: confirm final form provider and email host --> We share information with our own team members only where they need it to carry out your clean.</p>
<h2>How long we keep it</h2>
<p>We keep enquiry details for as long as needed to respond and, if you do not become a client, delete them within 12 months. Client records are kept for as long as required for accounting and legal purposes. <!-- TODO: confirm retention periods with client --></p>
<h2>Cookies</h2>
<p>This website does not use analytics or advertising cookies. Embedded content, such as the map on our contact page, is provided by Google and may set its own cookies when you interact with it. If we add analytics in future we will ask for your consent first.</p>
<h2>Your rights</h2>
<p>You have the right to access, correct or delete your personal data, to restrict or object to its processing, and to data portability. To exercise any of these rights, contact us at <a href="mailto:${BIZ.email}">${BIZ.email}</a>. You also have the right to lodge a complaint with the Data Protection Commission (<a href="https://www.dataprotection.ie" target="_blank" rel="noopener">dataprotection.ie</a>).</p>
`);

legal('terms/', 'Terms of Service', 'Terms of Service | Pink Lady Cleaning', 'Terms of service for Pink Lady Cleaning Services Ltd, Dublin.', (R) => `
<p>These terms apply to cleaning services provided by ${BIZ.legal}, ${BIZ.street}, ${BIZ.locality}, ${BIZ.region} (“Pink Lady”, “we”, “us”), and to your use of this website.</p>
<h2>Quotes</h2>
<p>Quotes are prepared from the information you give us about your property and requirements. If the work needed differs materially from what was described, we will discuss any change with you before continuing.</p>
<h2>Bookings, changes and cancellations</h2>
<p>Please give us as much notice as possible if you need to change or cancel a booking. <!-- TODO: confirm with client — notice period and any cancellation charge --></p>
<h2>Access and safety</h2>
<p>You agree to provide safe access to the property at the agreed time and to let us know about anything that needs special care, such as delicate surfaces, valuable items or alarm systems.</p>
<h2>Our standard</h2>
<p>Every clean follows a checklist agreed with you and finishes with a quality check. If anything is not right, please tell us as soon as possible and we will put it right.</p>
<h2>Payment</h2>
<p>Payment terms will be set out in your quote. <!-- TODO: confirm with client — payment methods and timing --></p>
<h2>Liability</h2>
<p><!-- TODO: confirm with client — insurance cover and liability wording (CLIENT_QUESTIONS.md #1) -->Please contact us straight away if you believe any damage has occurred during a clean so we can look into it promptly.</p>
<h2>This website</h2>
<p>We work to keep the information on this website accurate but it may change without notice. See our <a href="${R}privacy-policy/">Privacy Policy</a> for how we handle personal data.</p>
`);

// ---------- 404 ----------
pages.push({
  path: '404.html', file: '404.html', noindex: true, absolute: true,
  title: 'Page not found | Pink Lady Cleaning', desc: 'The page you were looking for could not be found.',
  body: (p, R) => `
<section class="plain-head" style="border:0;min-height:80vh;display:flex;align-items:center">
  <div class="container container--narrow text-center">
    <p class="eyebrow eyebrow--center" data-reveal="fade">404</p>
    <h1 class="display" data-split>This page has <em>moved on</em></h1>
    <p class="lead" data-reveal style="--d:400">The page you were looking for could not be found.</p>
    <div class="btn-row" style="justify-content:center;margin-top:32px" data-reveal><a class="btn" href="${R}">Return home ${ICON.arrow}</a><a class="btn btn--ghost" href="${R}services/">Our services</a></div>
  </div>
</section>`,
});

/* ---------------------------------------------------------------------------
   Write
--------------------------------------------------------------------------- */
for (const p of pages) {
  // 404 is served from arbitrary URLs, so it uses root-absolute paths
  const depth = p.file ? 0 : p.path.split('/').filter(Boolean).length;
  const R = p.absolute ? '/' : '../'.repeat(depth);
  const html = head(p, R) + header(p, R) + p.body(p, R) + footer(R);
  const out = p.file ? join(ROOT, p.file) : join(ROOT, p.path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html.replace(/\n{3,}/g, '\n\n'));
}

const urls = pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${SITE_URL}${p.path}</loc><changefreq>monthly</changefreq><priority>${p.path === '' ? '1.0' : p.isService || p.path === 'free-online-quote/' ? '0.8' : '0.6'}</priority></url>`).join('\n');
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`);
writeFileSync(join(ROOT, 'site.webmanifest'), JSON.stringify({ name: 'Pink Lady Cleaning', short_name: 'Pink Lady', icons: [{ src: 'assets/img/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'assets/img/icon-512.png', sizes: '512x512', type: 'image/png' }], theme_color: '#FAF7F3', background_color: '#FAF7F3', display: 'standalone', start_url: '/' }, null, 2));
console.log(`Built ${pages.length} pages into ${ROOT}`);
