import './_noop-client';
// This is the root page for authenticated users.
// We will build the main dashboard here later.

export default function AppRootPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to BrandMate v3</h1>
      <p className="text-copy-secondary">
        Here you&apos;ll see your brands and content once M2+ features are implemented.
      </p>
    </div>
  );
}
