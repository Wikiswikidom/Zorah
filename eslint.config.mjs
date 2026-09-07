import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // The existing app uses effects for client-side network synchronization.
      // Keep the rule visible as a warning while we migrate those flows to a data cache.
      'react-hooks/set-state-in-effect': 'warn',
      // Existing server-rendered data loaders use defensive try/catch around data access.
      'react-hooks/error-boundaries': 'warn',
      // App Router navigation already works correctly; these are legacy Pages Router hints.
      '@next/next/no-html-link-for-pages': 'warn',
      // Existing editorial copy contains intentional apostrophes in JSX text.
      'react/no-unescaped-entities': 'warn',
      // Some server-rendered catalog/campaign logic intentionally evaluates current time.
      'react-hooks/purity': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
