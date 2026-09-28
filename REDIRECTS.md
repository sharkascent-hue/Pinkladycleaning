# URLs & 301 redirects

The new site **keeps the old page names as URLs wherever it can**, so most existing Google rankings carry straight over with no redirect needed.

⚠️ The old slugs below are inferred from the current site's menu labels. **Check the real ones in the old WordPress sitemap** (`pinklady.ie/sitemap.xml` or `/wp-sitemap.xml`) before launch and adjust.

## Kept as-is (no redirect needed, assuming the old slug matches)
| URL | New page |
|---|---|
| `/` | Home |
| `/one-off-cleaning/` | Deep Cleaning (one-off) |
| `/carpet-cleaning/` | Carpets, Rugs & Upholstery |
| `/end-of-tenancy-cleaning/` | Move-In / Move-Out (keeps the "end of tenancy" keyword) |
| `/after-builders-cleaning/` | After Builders & Renovation |
| `/our-story/` | Our Story / About |
| `/free-online-quote/` | Request a Quote |
| `/get-in-touch/` | Contact |
| `/privacy-policy/` | Privacy Policy |

## New pages
`/services/`, `/luxury-home-cleaning/`, `/event-cleaning/`, `/luxury-cleaning/`, `/mansion-estate-cleaning/`, `/penthouse-cleaning/`, `/period-home-cleaning/`, `/areas-we-serve/`, `/reviews/`, `/terms/`

## 301 redirects to add
| Old URL (verify) | Redirect to |
|---|---|
| `/office-cleaning-dublin/` (office cleaning has been dropped) | `/services/` |
| `/why-us/` | `/our-story/` |
| `/our-services/` | `/services/` |
| `/terms-of-service/` (or whatever the old terms slug is) | `/terms/` |
| `/one-off-cleaning-service-dublin/` (if it exists) | `/one-off-cleaning/` |
| `/carpet-cleaning-dublin/` (if it exists) | `/carpet-cleaning/` |
| Any `/wp-content/…`, `/category/…`, `/author/…`, `/feed/` | `/` |

### Netlify (`site/_redirects`)
```
/office-cleaning-dublin/  /services/  301
/why-us/            /our-story/   301
/our-services/      /services/    301
/terms-of-service/  /terms/       301
```

### Apache (`.htaccess`)
```
Redirect 301 /office-cleaning-dublin/ /services/
Redirect 301 /why-us/ /our-story/
Redirect 301 /our-services/ /services/
Redirect 301 /terms-of-service/ /terms/
```

After launch, submit `https://pinklady.ie/sitemap.xml` in Google Search Console and watch the Pages report for 404s.
