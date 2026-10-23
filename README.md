# Jonaki — landing website

The public website for **Jonaki, a voice-first walking assistant for Android**.
It explains the product honestly, documents the app's current capabilities, and
provides a configurable way to distribute the Android APK.

This is a static, single-page marketing site with a dark, near-monochrome
theme. It has no accounts, no database, no admin panel, and no analytics.
Nothing is fabricated: unavailable features and unpublished release details are
labelled as such.

## Stack

- Vite 7 + React 19 + TypeScript
- Tailwind CSS v4 with shadcn/ui primitives (Radix)
- Lucide icons
- Framer Motion for the hero entrance only; everything else uses CSS and
  `IntersectionObserver`
- Fonts: Instrument Serif (display) and Inter (interface), loaded from Google
  Fonts with a system-serif fallback
- Dark-only palette defined in `src/index.css`: deep midnight surfaces, warm
  white text, soft lavender glow, and firefly gold accents

The Convex/auth starter files from the template are still present but are not
routed or used by this site. `src/main.tsx` only renders the landing page and
the not-found page.

## Run and build

```bash
bun install
bun run dev                 # managed by the Freebuff platform in this project
bun tsc -b --noEmit         # typecheck
bun run build               # production build into dist/
bun run preview             # preview the built site
```

## Project structure

```
index.html                        SEO metadata, fonts, JSON-LD
public/logo.svg                   favicon / brand mark
public/og-image.png               1200×630 social preview image
public/_headers                   APK MIME headers for Netlify / Cloudflare Pages
src/config/site.ts                SINGLE SOURCE OF TRUTH for brand + APK release
src/components/site/
  Nav.tsx                         sticky nav, scroll-spy, accessible mobile menu
  Hero.tsx                        above-the-fold hero + Android label
  Mission.tsx                     purpose and value propositions
  Features.tsx                    available vs. not-in-release capability cards
  HowItWorks.tsx                  three-step timeline + static mockup
  AppPreview.tsx                  accessible gallery + keyboard lightbox
  Download.tsx                    midnight download band + verified release facts
  Trust.tsx                       accessibility practices + safety notice
  Faq.tsx                         accordion FAQ
  Footer.tsx                      navigation, legal dialogs, version line
  ApkDownload.tsx                 download button, HEAD probe, install dialog
  PhoneMockup.tsx                 dark Android screen mockups + image override
  Brand.tsx                       original firefly + path mark
  Reveal.tsx / SectionHeading.tsx shared layout primitives
src/pages/Landing.tsx             page composition
src/pages/NotFound.tsx            themed 404
src/index.css                     design tokens, focus styles, reveal motion
```

## APK download: one source of truth

Everything about the APK lives in `src/config/site.ts` under `site.release`:

```ts
release: {
  apkUrl: "",        // URL of the real signed APK
  version: "",       // e.g. "1.0.0"
  fileSize: "",      // e.g. "18.4 MB"
  minAndroid: "",    // e.g. "Android 8.0 (API 26)"
  releaseDate: "",   // e.g. "2026-11-02"
  requirements: [],  // verified device requirements, one per line
  sha256: "",        // checksum of the exact published build
}
```

You can also provide the URL at build time instead of editing the file:

```bash
VITE_JONAKI_APK_URL="https://example.com/downloads/Jonaki-Android-v1.0.0.apk"
```

Empty metadata fields are hidden — the site never invents a version, size,
release date, checksum, or requirement.

### How the button behaves

| State                                                          | What happens                                                                                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apkUrl` empty                                                 | Buttons open a dialog explaining that the release is not published yet. No download starts.                                                      |
| `apkUrl` is a same-origin path (e.g. `/downloads/...`)         | A `HEAD` request checks the file. If it is missing or returns HTML, the site shows an "unavailable" dialog instead of downloading an error page. |
| `apkUrl` is an external URL (GitHub Releases, official domain) | The button links directly to that URL. Cross-origin hosts cannot be probed from the browser, so availability is the host's responsibility.       |

The `download` filename (`Jonaki-Android-v1.0.0.apk`) is only suggested when
`version` is filled in, so a mismatched filename is never advertised.

### Add the real APK — option A: host it yourself

1. Put the signed file in `public/downloads/`, for example
   `public/downloads/Jonaki-Android-v1.0.0.apk`.
2. In `src/config/site.ts` set:
   ```ts
   apkUrl: "/downloads/Jonaki-Android-v1.0.0.apk",
   version: "1.0.0",
   ```
3. Fill in the other fields only after verifying them against the build.
4. Keep large binaries out of git if your host or repository has size limits;
   upload them to your release storage instead.

`public/_headers` already sets the Android package MIME type for Netlify and
Cloudflare Pages:

```
/downloads/*
  Content-Type: application/vnd.android.package-archive
  Content-Disposition: attachment
```

For other servers:

- **nginx** — add `types { application/vnd.android.package-archive apk; }`
- **Apache** — add `AddType application/vnd.android.package-archive .apk`
- **Vercel** — add the same header in `vercel.json` under `headers`

### Add the real APK — option B: GitHub Releases

1. Create a release and upload `Jonaki-Android-v1.0.0.apk` as an asset.
2. Copy the asset URL, which looks like
   `https://github.com/<owner>/<repo>/releases/download/v1.0.0/Jonaki-Android-v1.0.0.apk`.
3. Set `apkUrl` to that URL, and `version` to `1.0.0`.
4. Do not use a "latest" URL unless the file name stays stable; a versioned
   URL is easier for people to verify and for you to archive.

## Content and assets to update

- **Screenshots.** The phones in the hero, how-it-works panel, gallery, and
  lightbox are HTML recreations of the supplied welcome, dashboard, permissions,
  and walking screens (`src/components/site/PhoneMockup.tsx`). To use real
  captures instead, save PNGs in `public/screens/` and fill in the
  `screenImages` map near the top of that file:
  ```ts
  export const screenImages = {
    welcome: "/screens/welcome.png",
    dashboard: "/screens/dashboard.png",
    permissions: "/screens/permissions.png",
  };
  ```
  The images are rendered with `object-cover` in a 9:19 frame, so export at
  roughly 1080×2340 or the same aspect ratio. Update the gallery captions if the
  captures differ from the recreations.
- **What is in the release.** The supplied screen captures show obstacle
  scanning, pedestrian navigation, voice commands, emergency help, and the
  permissions flow, so all six feature cards are marked `available` in
  `src/config/site.ts`. Confirm each one in the installed release before
  publishing and update any card that is not actually shipped.
- **Support contact.** Set `contactEmail` to a real, monitored address. Until
  then the FAQ and footer clearly state that no support address is published.
- **Legal pages.** Put real policy URLs in `site.legal.privacyUrl` and
  `site.legal.termsUrl`. While they are empty, the footer opens a "not yet
  published" dialog instead of inventing a policy.
- **Release checksum.** Generate it from the exact file you publish:
  `sha256sum Jonaki-Android-v1.0.0.apk`. The download section shows it only
  when provided.
- **Social preview and icons.** `public/og-image.png` is a 1200×630 dark
  branded card; app icons are dark tiles generated from the firefly mark. Replace
  them if the branding changes. Before launch, set the deployed domain in
  `index.html` for `og:image` and add an absolute canonical URL.
- **Analytics.** None is configured. If you add privacy-friendly analytics,
  document it in the privacy policy first.

## Accessibility notes

Implemented in this site:

- Skip link to the main landmark
- Sticky navigation with `aria-current`, a keyboard-operable mobile menu, and
  Escape/focus restoration handled by Radix Dialog
- Semantic section landmarks, heading order, lists, and labelled controls
- Visible `:focus-visible` outline on every interactive element
- Gallery lightbox with previous/next buttons, arrow-key navigation, and a
  live position announcement
- `prefers-reduced-motion` support for reveals, smooth scrolling, and the
  firefly trails
- 44 px minimum height on primary controls and responsive type

This site has **not** been formally audited against WCAG, and no certification
or clinical validation is claimed anywhere in the copy.

Manual keyboard check: Tab from the top, use the skip link, open the mobile menu
below 768 px, open a gallery preview, and confirm Escape returns focus. All
links point to existing section IDs.

## Deploy

1. `bun run build`
2. Upload `dist/` to any static host.
3. Add an SPA fallback so the not-found route can load the app:
   - Netlify (`public/_redirects`): `/*  /index.html  200`
   - Vercel: rewrite all paths to `/index.html`
   - nginx: `try_files $uri $uri/ /index.html;`
4. Keep the APK content type rules from `public/_headers`.
5. Hash-named JS/CSS assets can be cached for a year; `index.html` should not
   be cached long-term.

## Remaining configuration checklist

- [ ] Upload the signed APK and set `site.release.apkUrl`
- [ ] Verify and fill version, APK size, minimum Android version, release date,
      device requirements, and SHA-256
- [ ] Optionally replace the HTML screen mockups with real PNG captures via
      `screenImages`
- [ ] Add a monitored support email (`site.contactEmail`)
- [ ] Publish privacy policy and terms, then fill `site.legal`
- [ ] Verify the six feature descriptions against the installed release
- [ ] Replace the relative `og:image` with an absolute deployed URL and add a
      canonical link
- [ ] Test the download on a real Android device (the site reports the
      unpublished state until an APK exists)
