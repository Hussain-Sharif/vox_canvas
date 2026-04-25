"use client"

import { overlayBase } from "@/utils/tldraw"
import { useState } from "react"
import { useEditor } from "tldraw"

function VoiceControlPanel() {
  const editor = useEditor()
  const [input, setInput] = useState('')

  const handleRun = () => {
    // const commands = parseCommand(input)       // to write
    // commands.forEach(cmd => executeCommand(editor, cmd))
    setInput('')
  }

  return (
    <div style={{ ...overlayBase, bottom: 80, left: 16, display: 'flex', gap: 8 }}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type a command, e.g. 'add rectangle at cursor'"
        style={{ padding: '8px 12px', fontSize: 14 }}
      />
      <button onClick={handleRun} style={{ padding: '8px 16px', fontSize: 14 }}>
        Run
      </button>
    </div>
  )
}

export default VoiceControlPanel