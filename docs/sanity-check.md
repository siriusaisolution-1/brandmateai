# Sanity Check

- Generated: 2025-08-19T18:22:30Z

## Node & Package Managers
```bash
v20.18.1
10.13.1
10.8.2
```

## Next.js info (ako dostupno)
```bash

Operating System:
  Platform: linux
  Arch: x64
  Version: #1 SMP PREEMPT_DYNAMIC Thu Jul  3 09:27:14 UTC 2025
  Available memory (MB): 7948
  Available CPU cores: 2
Binaries:
  Node: 20.18.1
  npm: 10.8.2
  Yarn: N/A
  pnpm: 10.13.1
Relevant Packages:
  next: 15.4.1 // There is a newer version (15.4.7) available, upgrade recommended! 
  eslint-config-next: 15.4.1
  react: 18.3.1
  react-dom: 18.3.1
  typescript: 5.9.2
Next.js Config:
  output: N/A
```

## TypeScript compile (dry run)
```bash
Version 5.9.2
src/app/(app)/content/generate/social-burst/page.tsx(30,5): error TS1109: Expression expected.
Type check finished with issues (see console).
```

## Tailwind config prisutan?
```bash
tailwind.config.js
```

## Firebase config fajlovi
```bash
{
  "hosting": { "source": ".", "ignore": ["firebase.json", "**/.*", "**/node_modules/**"], "frameworksBackend": { "region": "us-central1" } },
  "functions": { "source": "functions", "codebase": "default", "runtime": "nodejs20" },
  "firestore": { "rules": "firestore.rules" },
  "storage": { "rules": "storage.rules" }
}
```

