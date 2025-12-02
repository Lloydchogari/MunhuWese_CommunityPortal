'use client'

export default function GlobalError({ error }: { error: Error }) {
  return (
    <main className="main">
      <div className="card max-w-lg mx-auto">
        <h1>Something went wrong</h1>
        <p className="text-sm text-gray-700">{error?.message ?? 'An unexpected error occurred.'}</p>
      </div>
    </main>
  )
}
