# Heldi homepage

High-fidelity Next.js implementation scaffolded from the design handoff in
`design_handoff_heldi_homepage/`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/page.tsx` — homepage entry point and designer-tunable values
- `components/heldi-homepage.tsx` — homepage sections and interactions
- `app/globals.css` — design tokens, responsive layout, and animation
- `public/images/` — final creative assets supplied in the handoff
- `design_handoff_heldi_homepage/` — original reference and source handoff

## Tunable values

The homepage component accepts:

- `grams` — protein added per bowl (currently a placeholder)
- `heroAnimation` — `"split-flap"` or `"dissolve"`
- `flapDwellMs` — word-board dwell time
- `ticker` — shows or hides the marquee

Change these in `app/page.tsx`. Before launch, confirm the protein value, dish
nutrition values, hero animation, and final product claims with the client.

## Waitlist integration

The two forms share a local success state, matching the prototype. Connect
`WaitlistForm` to the chosen email platform or API before launch; no endpoint,
credentials, or consent requirements were included in the handoff.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
