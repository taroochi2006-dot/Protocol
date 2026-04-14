// This generates the favicon dynamically
import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32, height: 32,
          background: '#0A0A0A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid #C9A96E',
          borderRadius: 4,
          fontFamily: 'serif',
          fontSize: 18,
          fontWeight: 700,
          color: '#C9A96E',
        }}
      >
        P
      </div>
    ),
    { ...size }
  )
}
