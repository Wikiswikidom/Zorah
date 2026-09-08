import { LoadingSpinner } from '@/components/loading-spinner'

export default function Loading(){
  return <div aria-live="polite" style={{position:'fixed',inset:0,zIndex:9999,display:'grid',placeItems:'center',background:'rgba(247,243,236,.82)',backdropFilter:'blur(8px)'}}>
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',border:'1px solid rgba(17,17,17,.1)',background:'#fff',boxShadow:'0 10px 30px rgba(17,17,17,.08)',fontSize:11,letterSpacing:'.14em',textTransform:'uppercase'}}>
      <LoadingSpinner label="Loading page" size={18}/><span>Loading</span>
    </div>
  </div>
}
