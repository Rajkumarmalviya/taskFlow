import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './features/shared'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'
// Devtools only in development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>

      {import.meta.env.DEV && <DevtoolsToggler />}
    </QueryClientProvider>
  </StrictMode>,
)

function DevtoolsToggler() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Hide devtools" : "Show devtools"}
        className="fixed right-4 bottom-4 z-50 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        {open ? "Hide Devtools" : "Show Devtools"}
      </button>

      {open ? <ReactQueryDevtools initialIsOpen={true} /> : null}
    </>
  );
}
