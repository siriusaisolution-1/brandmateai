# Dependencies Report

- Generated: 2025-08-19T18:22:30Z

## package.json (summary)
```json
{
  "name": "studio",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "audit:local": "bash scripts/bm_audit.sh"
  },
  "deps": 30,
  "devDeps": 15
}
```

## pnpm list (top level)
```bash
Legend: production dependency, optional only, dev only

studio@0.1.0 /home/user/BrandMate-2.0 (PRIVATE)

dependencies:
@genkit-ai/core 1.16.0
@genkit-ai/firebase 1.16.0
@genkit-ai/flow 0.5.17
@genkit-ai/googleai 1.16.0
@radix-ui/react-avatar 1.1.10
@radix-ui/react-dialog 1.1.14
@radix-ui/react-dropdown-menu 2.1.15
@radix-ui/react-label 2.1.7
@radix-ui/react-slot 1.2.3
@radix-ui/react-switch 1.2.6
@radix-ui/react-toast 1.2.14
@radix-ui/react-tooltip 1.2.7
@sentry/nextjs 9.45.0
@tanstack/react-query 5.84.2
canvas-confetti 1.9.3
class-variance-authority 0.7.1
clsx 2.1.1
cmdk 1.1.1
date-fns 4.1.0
firebase 11.10.0
genkit 1.16.0
lucide-react 0.525.0
next 15.4.1
next-themes 0.4.6
novita-sdk 3.1.3
react 18.3.1
react-big-calendar 1.19.4
react-dom 18.3.1
react-joyride 2.9.3
react-markdown 10.1.0
reactfire 4.2.3
tailwind-merge 3.3.1
zod 4.0.17

devDependencies:
@eslint/eslintrc 3.3.1
@tailwindcss/postcss 4.1.11
@tailwindcss/typography 0.5.16
@tanstack/react-query-devtools 5.84.2
@types/canvas-confetti 1.9.0
@types/node 20.19.10
@types/react 19.1.9
@types/react-dom 19.1.7
autoprefixer 10.4.21
eslint 9.33.0
eslint-config-next 15.4.1
postcss 8.5.6
tailwindcss 3.4.17
tailwindcss-animate 1.0.7
tailwindcss-cli 0.1.2
typescript 5.9.2
```

## Potential firebase/reactfire mismatch (heuristika)
```text
firebase: ^9.23.0
reactfire: 4.2.3
Note: reactfire 4.x peer je ^9; ako build radi – OK. Ako ne – razmotri downgrade firebase na ^9.x ili upgrade reactfire (kada postane dostupno).
```

