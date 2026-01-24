# Frontend Components

This folder contains all the public-facing frontend components for the Talkio landing page.

## Structure

```
src/frontend/
├── components/          # Landing page components
│   ├── Navbar.tsx      # Navigation bar with logo and menu
│   ├── Hero.tsx        # Hero section with headline and CTA
│   ├── Features.tsx    # Feature cards section
│   ├── FinalCTA.tsx    # Call-to-action section
│   └── Footer.tsx      # Footer with logo and copyright
├── LandingPage.tsx     # Main landing page component
├── index.ts            # Barrel exports
└── README.md           # This file
```

## Components

### `LandingPage.tsx`
The main landing page component that composes all sections together. Use this as the default export for your homepage.

```tsx
import { LandingPage } from '@/frontend'

export default function HomePage() {
  return <LandingPage />
}
```

### Individual Components

#### `Navbar`
Sticky navigation bar with:
- Talkio logo
- Product, Pricing, About links
- "Request Demo" CTA button
- Mobile responsive menu
- GSAP animations on load and scroll

#### `Hero`
Hero section featuring:
- Main headline
- Subheadline
- Dashboard preview placeholder
- Primary and secondary CTAs
- GSAP staggered animations

#### `Features`
Three-column feature grid with:
- Post-call analysis
- Risk monitoring
- Client context
- Icon SVGs
- Hover effects
- Scroll-triggered animations

#### `FinalCTA`
Bottom call-to-action section with:
- Heading
- Description
- "Request Demo" button
- Scroll-triggered animation

#### `Footer`
Footer with:
- Talkio logo (white version)
- Copyright text
- Dark indigo background
- Fade-in animation

## Animations

All components use GSAP (GreenSock Animation Platform) for smooth animations:
- Fade in on page load
- Scroll-triggered reveals
- Staggered element animations
- Smooth transitions

## Design System

### Colors
- Primary: Violet-500 to Violet-600
- Text: Slate-900, Slate-600
- Background: White, #faf8ff (light violet)
- Footer: Indigo-950

### Typography
- Font: Default Next.js font stack
- Headings: Bold, tracking-tight
- Body: Slate-600

### Spacing
- Max content width: 1200px
- Section padding: 14-20 (responsive)
- Component gaps: 4-8

## Usage

### Using the complete landing page:
```tsx
import { LandingPage } from '@/frontend'

export default function HomePage() {
  return <LandingPage />
}
```

### Using individual components:
```tsx
import { Navbar, Hero, Features } from '@/frontend'

export default function CustomPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      {/* Your custom content */}
    </>
  )
}
```

## Dependencies

- Next.js (App Router)
- GSAP (animations)
- Tailwind CSS (styling)
- Lucide React (icons - only in Features)

## Responsive Design

All components are fully responsive with breakpoints:
- Mobile: default
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)

## Accessibility

- Semantic HTML elements
- ARIA labels and landmarks
- Keyboard navigation support
- Focus-visible states
- Screen reader friendly
