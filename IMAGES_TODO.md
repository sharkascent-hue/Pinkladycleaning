# Images to replace

Every photo on the site is currently an Unsplash placeholder, hotlinked from `images.unsplash.com`. They are all defined in one place, the `IMG` object at the top of `build.mjs`. If a photo ever fails to load, a soft blush/ivory panel shows instead, so the layout never breaks.

**To swap in real photos:**
1. Export each photo as WebP, about 2000px on the long edge, and put it in `site/assets/img/photos/`.
2. In `build.mjs`, change the `img()` helper (or the entry) to point at the local file.
3. Run `node build.mjs`.

Brief: bright, airy luxury interiors (marble, big windows, staircases, penthouse views, spotless kitchens). No stock photos of people in rubber gloves.

| Key | Current placeholder (Unsplash ID) | Used on | Ideal real photo |
|---|---|---|---|
| `hero` | 1600210492486-724fe5c67fb0 | Home hero, Contact hero | Signature shot: grand living room or entrance hall, lots of light |
| `living` | 1600607687939-ce8a6c25118c | Luxury Home Cleaning card/hero, Our Story | Open-plan living space |
| `bedroom` | 1505691938895-1758d7feb511 | Luxury Home Cleaning detail, Reviews hero | Made-up bedroom, crisp linen |
| `kitchen` | 1600566753190-17f0baa2a6c3 | Deep Cleaning card/hero, Quote hero | Marble kitchen island |
| `bathroom` | 1552321554-5fefe8c9ef14 | Home intro (small), Deep Cleaning detail | Marble bathroom |
| `dining` | 1600573472550-8090b5e0745e | Event Cleaning card/hero, Services hero | Dining room set for guests |
| `lounge` | 1616486338812-3dadae4b4ace | Event detail, Carpets detail, Our Story hero | Sunlit lounge |
| `empty` | 1600566753086-00f18fb6b3ea | Move-In/Move-Out card/hero | Empty, freshly cleaned room |
| `stair` | 1600047509807-ba8f99d2cdde | Home intro (large), Move-In detail | Staircase / hallway |
| `interior` | 1618221195710-dd6b41faaea6 | After Builders card/hero, Home "Discretion" section | Newly renovated interior |
| `kitchen2` | 1556912173-3bb406ef7e77 | After Builders detail | Kitchen detail |
| `sofa` | 1586023492125-27b2c045efd7 | Carpets & Upholstery card/hero | Sofa and rug close-up |
| `exterior` | 1600585154340-be6161a56a0c | Areas hero | Exterior of a large Dublin home |
| `villa` | 1613490493576-7fde63acd811 | CTA band, Luxury Cleaning hub, Mansion & Estate page, Services "Luxury" block | Exterior of a large residence |

Also:
- **Home hero artwork:** `site/assets/img/hero-ribbons.webp/.jpg` is the ribbons-and-lady graphic from the current site, taken from a 1079×799 screenshot. It looks soft on big screens, so **ask for the original high-resolution file** and replace both files with the same names.
- **Logo:** `assets/logo/pinklady-logo-transparent.png` was auto-cut and also removed the white silhouette. For dark backgrounds I made `site/assets/img/logo-light.*` (white silhouette + ivory tagline). Edges are acceptable, but **ask for the vector/original logo file** for crisp results.
- **OG / social share image:** `site/assets/img/og-image.jpg` is just the logo on ivory. Replace it with a 1200×630 hero photo carrying the logo.
- I couldn't preview the Unsplash IDs from my build environment (no access), so check each one loads. Any that don't just show the placeholder panel.
