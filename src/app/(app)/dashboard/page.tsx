import Noop from './_noop-client'

// This is the root page for authenticated users.
// We will build the main dashboard here later.

export default function AppRootPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      <p className="text-copy-secondary">This is where your main dashboard content will go.</p>
    </div>
  );
}
