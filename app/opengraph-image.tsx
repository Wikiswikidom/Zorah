import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Zorah Handbags — Crafted to be carried.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        background: '#f4f0e8',
        color: '#173d32',
        fontFamily: 'serif',
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: '0.18em', textTransform: 'uppercase' }}>ZORAH HANDBAGS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 76, lineHeight: 1.02 }}>Crafted to be carried.</div>
        <div style={{ fontSize: 30, color: '#42564f' }}>Contemporary leather handbags crafted in Lagos.</div>
      </div>
      <div style={{ fontSize: 22, letterSpacing: '0.08em' }}>ZORAH · LAGOS · NIGERIA</div>
    </div>,
    size,
  )
}
