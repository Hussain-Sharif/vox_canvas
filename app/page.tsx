'use client'

import MainContextWindow from '@/engines/canvas/main-context-window'
import { Tldraw} from 'tldraw'
import 'tldraw/tldraw.css'


const Canvas = () => {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw persistenceKey='example' >
		<MainContextWindow />
      </Tldraw>
    </div>
  )
}

export default Canvas