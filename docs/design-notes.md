# Design Notes (Reference: faizintifada.com)

Based on the analysis of the reference website, here are the key design principles and elements to adapt for the software engineer portfolio.

## 1. Typography
- **Font Family**: Modern, clean sans-serif (e.g., Inter, Geist, or Plus Jakarta Sans) with tight letter-spacing (`tracking-tight`).
- **Hierarchy**:
  - **Hero Title**: High-contrast, bold display text (very large, e.g., 4xl/5xl).
  - **Section Headings**: Semi-bold, medium-large (e.g., 2xl/3xl).
  - **Body Text**: Muted gray (`text-secondary`), 14-16px, with comfortable line height (~1.6).
  - **Badges/Labels**: Small, uppercase, wide letter-spacing (`tracking-wider`), and bold.

## 2. Spacing & Layout
- **Container**: A central rounded container (`rounded-3xl` or `rounded-[32px]`) that sits within a softer, contrasting ambient background. This creates a "floating" layout.
- **Whitespace**: Generous internal padding (32px - 60px) and large gaps between sections (64px - 96px) to maintain a clean, uncluttered look.
- **Grids**: 2-column formats for project cards with ample gaps (24px - 32px).

## 3. Component Styles
- **Buttons**:
  - **Primary**: Full pill shape (`rounded-full`), solid high-contrast background with white text, and a subtle top-border highlight (embossed look).
  - **Secondary**: Outlined pill (`rounded-full`), transparent background that fills slightly on hover.
- **Cards**:
  - **Project Cards**: Large image containers with large border radii (`rounded-2xl` / `rounded-3xl`). Text and tags are cleanly stacked below the image rather than overlapping it heavily.
- **Badges/Tags**: Pill-shaped with muted backgrounds and text colors.

## 4. Interaction & Motion
- **Tactile Feedback**: Interactive elements scale down slightly when clicked/pressed (`active:scale-95` or similar) to feel tactile and responsive.
- **Hover States**: Smooth, quick transitions (`duration-200 ease-out`) for color and background changes. No extreme transformations; everything feels grounded.

## 5. Color Scheme (Light Mode Focus)
- **Background**: Soft ambient neutral gray (`#f4f4f4` / `#f0f0f0`) for the outer body, with a crisp off-white or pure white (`#ffffff`) for the central elevated container.
- **Text**: Deep charcoal/near-black for primary text (`#0f172a`), and medium warm gray for secondary text (`#475569`).
- **Borders**: Very subtle and thin light gray borders to define edges without adding visual weight.

## Adaptation Plan
- Update `globals.css` to wrap the main `<main>` content inside a `rounded-3xl` floating container with a soft background behind it.
- Update `tailwind.config.ts` (if needed) or `globals.css` typography utilities to use tighter tracking for headings.
- Refine buttons and tags in `Button` and `TechTag` to use the pill-shape (`rounded-full`) and tactile click (`active:scale-95`).
- Update the project card border radius to be larger and softer.
