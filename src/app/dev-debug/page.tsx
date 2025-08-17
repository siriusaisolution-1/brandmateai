// src/app/dev-debug/page.tsx
export default function DevDebug() {
  return (
    <pre id="dev-origins">
      {process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS}
    </pre>
  )
}
