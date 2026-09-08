export default function Loading(){
  return (
    <div aria-live="polite" aria-label="Loading page" style={{position:"fixed",inset:0,zIndex:9999,display:"grid",placeItems:"center",background:"rgba(247,243,236,.42)",backdropFilter:"blur(3px)",pointerEvents:"none"}}>
      <span aria-hidden="true" style={{width:30,height:30,border:"2px solid rgba(23,61,50,.22)",borderTopColor:"#173d32",borderRadius:"50%",animation:"zorah-page-spin .7s linear infinite",boxShadow:"0 4px 18px rgba(17,17,17,.12)"}} />
      <style>{`@keyframes zorah-page-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
