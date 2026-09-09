import { LoadingSpinner } from '@/components/loading-spinner'

export default function AccountLoading() {
  return (
    <main className="jumia-account-page" aria-busy="true">
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <LoadingSpinner size={30} label="Loading your account" />
      </div>
    </main>
  )
}
