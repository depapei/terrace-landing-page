# Terrace Design System

> Design reference for the Terrace landing page  
> Brand: **Terrace** · Legal name: **PT. Teras Teknologi**  
> Business: Website development and custom business / warehouse management software

## 1. Brand direction

Terrace presents itself as a modern, minimalist, corporate technology partner. The brand idea comes from two young people exchanging ideas on a terrace and deciding to build a software business together.

The design should communicate:

- **Clarity:** make services, packages, and next steps easy to understand.
- **Collaboration:** frame projects as a partnership, not just a transaction.
- **Practical technology:** focus on real business workflows and operational needs.
- **Quiet confidence:** use restrained colors, clear typography, and deliberate spacing instead of visual noise.

Avoid overly playful illustrations, excessive gradients, unnecessary decorative elements, and copy-heavy layouts.

## 2. Design principles

1. **Content first.** Each section should have one clear purpose and a visible heading.
2. **Strong contrast.** Use the dark ink color for emphasis and the sand color for key actions.
3. **Generous spacing.** Keep sections breathable and avoid crowding cards with text.
4. **Simple geometry.** Prefer square or lightly rounded shapes, thin borders, and clean alignment.
5. **Responsive by default.** Design for mobile and desktop, not desktop-only layouts.
6. **Motion with restraint.** Transitions should support navigation and orientation, not distract from content.

## 3. Color palette

| Token | Hex | Intended use |
|---|---|---|
| `ink` | `#1C1C1C` | Primary text, dark sections, featured package, footer, buttons |
| `stone` | `#CAC4BB` | Neutral secondary tone, subtle visual details |
| `sand` | `#EAD8AB` | Primary accent, highlighted labels, featured CTAs |
| `paper` | `#F7F5F0` | Main page background and text on dark surfaces |
| `muted` | `#77736D` | Secondary body copy |
| `line` | `rgba(28, 28, 28, 0.14)` | Light borders and dividers |

### Color usage

- Use `paper` as the default page background.
- Use `ink` for high-emphasis text and dark section backgrounds.
- Use `sand` sparingly for CTAs, small labels, active states, and emphasis.
- Use muted text only for supporting information, not important actions or critical content.
- On dark backgrounds, use `paper` for primary text and a light neutral such as `#BDB8AF` for supporting copy.
- Keep text/background contrast accessible. Do not use the accent color as small body text on a light background unless contrast is checked.

## 4. Typography

### Font stack

Use a clean system sans-serif stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Inter is the preferred visual reference. If it is not loaded, use the system fallback stack.

### Typographic hierarchy

- **Hero heading:** large, compact, bold/semibold; responsive `clamp()` sizing.
- **Section headings:** approximately 32–48px, tight line-height, slightly negative letter spacing.
- **Card headings:** approximately 25px, semibold.
- **Body copy:** 13–15px with generous line-height.
- **Navigation and labels:** approximately 10–13px; uppercase labels may use increased letter spacing.
- **Footer and metadata:** approximately 10–12px, while remaining readable.

Use sentence case for headings and calls to action. Reserve uppercase text for small section labels and metadata.

## 5. Layout and spacing

- **Maximum content width:** `1160px`.
- **Desktop container:** `min(1160px, calc(100% - 48px))`.
- **Mobile container:** `calc(100% - 36px)`.
- **Section vertical spacing:** around `100px` on desktop and `70px` on mobile.
- **Grid gaps:** generally 18–45px depending on component and viewport.
- **Border radius:** use restrained radii, generally 4–10px. The carousel controls may be circular.
- **Borders:** use thin, low-contrast lines to separate content without adding visual weight.

Align section headings, card edges, and content containers consistently. Avoid making every section a separate boxed card.

## 6. Navigation

The top navigation is sticky and remains at the top while scrolling.

### Default state
- Background: `paper`
- Text: `ink`
- Subtle bottom border
- Brand mark uses `ink` with a `sand` symbol

### Scrolled state
- Background: `ink`
- Text: `paper`
- Subtle shadow and low-contrast border
- Brand mark and primary navigation CTA switch to the reverse palette

The transition should be smooth and short, around 250ms. Navigation links scroll to the relevant page sections. On narrow mobile screens, hide the desktop link row and keep the brand and primary contact CTA visible.

## 7. Hero carousel

The hero is a full-bleed section that reaches both viewport edges. It is not constrained by the main content container.

### Structure
- Full-width carousel with three slides.
- Text and calls to action sit over the first slide, aligned to the left.
- Intro text and CTA are visible only on slide one.
- Slides two and three show their visual artwork and slide caption without the intro overlay.
- Bottom controls show the slide number, progress indicator, and previous/next controls.

### Motion and behavior
- Automatically advances every **6.5 seconds**.
- Previous/next buttons change slides and restart the timer.
- Pause autoplay while the pointer is over the hero.
- Use a fade transition between slides.
- Keep text readable using a dark overlay over the slide artwork.
- Respect `prefers-reduced-motion`.

### Visual direction
Use muted, architectural imagery or abstract artwork that relates to warehouses, dashboards, systems, and collaboration. The current HTML uses CSS-generated artwork as a placeholder. Replace it with licensed or owned imagery when production assets are available.

## 8. Partner marquee

A horizontal partner/cooperation logo strip appears immediately below the hero.

- Use subdued neutral colors so it supports rather than competes with the hero.
- Repeat the logo sequence to create a continuous horizontal marquee.
- Pause the marquee on hover.
- Keep logos visually consistent in height and spacing.
- Replace all sample names with approved partner names and official logo assets before publishing.
- Do not imply a real partnership until it has been confirmed.

If reduced motion is enabled, the marquee animation should be reduced or disabled.

## 9. Package cards

The package section replaces a generic service list and helps visitors understand the two main engagement options.

### Package A: Landing Page
- Price range: **Rp500 ribu–Rp1,5 juta**.
- Light card surface.
- Explain the business value and what is included.
- CTA: **Pilih paket**.

### Package B: Complex Management System
- Price: **Harga dinamis**, based on scope.
- Dark featured card with sand accent.
- Consultation and requirements analysis are mandatory before estimating the price.
- CTA: **Jadwalkan konsultasi**.

### Card behavior and content
- Both cards use the same overall structure and consistent spacing.
- Keep package name, price, description, included features, and CTA easy to scan.
- Use a dark surface to emphasize the custom management system option.
- Price ranges and package inclusions must be reviewed before launch so they reflect the actual offer.
- CTA links should use the approved contact destination.

## 10. About section

The About section uses a dark background and tells the origin story of Terrace.

Key message: Terrace began with two young people sharing ideas on a terrace. That conversation inspired a technology business focused on helping companies manage their operations more effectively.

The writing should feel genuine and grounded. Emphasize collaboration, openness, and building solutions around real business needs. Avoid making unsupported claims about company history, clients, or achievements.

## 11. Principles section

Present three principles in a simple numbered list with thin horizontal dividers:

1. **Pahami prosesnya** — understand the client's challenges and operational needs first.
2. **Bangun dengan terstruktur** — design systems that are understandable, maintainable, and usable.
3. **Kembangkan bersama** — collaborate so the solution can evolve with the business.

Use the sand accent for numbers and maintain clear separation between each principle.

## 12. FAQ accordion

The FAQ section uses a two-column layout on desktop and stacks into one column on mobile.

- Left column: section label, heading, and short introduction.
- Right column: expandable question list.
- One answer may be open at a time.
- Use a circular plus icon that rotates when the item is open.
- Keep dividers subtle and answer text readable.
- Implement questions as real buttons with `aria-expanded` and `aria-controls`.
- Ensure keyboard focus is visible and all answers remain accessible.

Current topics:
- Landing page pricing.
- How custom management system pricing is estimated.
- Customization to match business identity.
- How to start a project.
- Integration with other systems.

## 13. Contact CTA

Use a sand-colored panel near the end of the page.

- Clear, outcome-oriented heading.
- One short supporting sentence.
- One primary dark CTA that opens the approved contact channel.
- On mobile, stack the copy and CTA vertically.

Keep the CTA focused on starting a conversation rather than promising a specific result before requirements are known.

## 14. Footer

The footer uses the reverse palette: `ink` background with `paper` text and `sand` headings or highlights.

### Content columns
1. **Company introduction:** brand, short company description, partner references, and achievement/certification area.
2. **Page menu:** links to key page sections.
3. **Products & portfolio:** website, landing page, warehouse management, and custom system offerings.
4. **Contact:** approved email, WhatsApp, and project consultation link.

Include a lower row for copyright and secondary links.

All partner names, achievement badges, certifications, contact details, and portfolio links must be verified before launch. Placeholder content must not be presented as a real endorsement or credential.

## 15. Responsive behavior

### Desktop: above 900px
- Full navigation visible.
- Package cards use two columns.
- About and FAQ use two-column layouts.
- Footer uses four columns.

### Tablet: up to 900px
- Reduce navigation gaps.
- Reduce the gaps in About and FAQ layouts.
- Footer switches to two columns.

### Mobile: up to 650px
- Hide desktop navigation links while retaining the brand and CTA.
- Hero content uses smaller responsive typography and tighter side padding.
- Package cards stack vertically.
- About and FAQ switch to one column.
- Contact CTA stacks vertically.
- Footer uses two columns, then stacks footer metadata vertically.
- Keep interactive controls large enough to tap comfortably.

Test at narrow widths, including 320px, and ensure there is no horizontal overflow.

## 16. Interaction and accessibility

- Use semantic `header`, `nav`, `main`, `section`, and `footer` elements.
- Give interactive controls descriptive accessible names.
- Maintain visible keyboard focus indicators.
- Ensure text contrast is sufficient in both light and dark sections.
- Respect reduced-motion preferences.
- Avoid relying on color alone to indicate active states.
- Keep carousel slide state synchronized with its visible content and accessibility attributes.
- Use descriptive link text where possible.
- External links opened in a new tab should include `rel="noopener noreferrer"`.

## 17. Content and asset checklist before launch

- [ ] Replace CSS-generated hero artwork with final approved imagery if desired.
- [ ] Replace sample partner names with real, approved partner logos.
- [ ] Verify the company’s official email address.
- [ ] Verify the WhatsApp number and contact links.
- [ ] Replace the sample achievement badge with a verified credential, or remove it.
- [ ] Confirm package prices, inclusions, and service scope.
- [ ] Add real portfolio links and ensure each destination works.
- [ ] Confirm legal company name and copyright wording.
- [ ] Review Indonesian copy, spelling, and tone.
- [ ] Test mobile, tablet, desktop, keyboard navigation, and reduced-motion behavior.
- [ ] Check page metadata and social sharing preview before deployment.

## 18. Implementation notes

The current mockup is a standalone HTML page with CSS and JavaScript embedded in the same file. The design system can be migrated into component-based architecture later, but the visual tokens and behaviors should remain consistent.

Suggested component boundaries:
- `Navbar`
- `HeroCarousel`
- `PartnerMarquee`
- `PackageCard`
- `AboutSection`
- `PrinciplesList`
- `FAQAccordion`
- `ContactCTA`
- `Footer`

Keep brand colors, spacing, and typography centralized as design tokens rather than duplicating values across components.
