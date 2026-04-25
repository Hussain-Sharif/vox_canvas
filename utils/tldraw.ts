import React from "react";



// ─── Overlay styles ────────────────────────────────────────────────────────
// Children of <Tldraw> are positioned inside tldraw's container div.
// Always use explicit zIndex + pointerEvents or your UI will be buried.
export const overlayBase: React.CSSProperties = {
  position: 'absolute',
  zIndex: 400,           // above tldraw's toolbar (~300)
  pointerEvents: 'auto', // tldraw's canvas captures pointer events; re-enable for your UI
}