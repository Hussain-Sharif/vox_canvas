'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useEditor } from 'tldraw'
import { getCanvasContext } from '../canvas/utils/getCanvasContext'
import { executeCommand } from '../command/controllers/execute'
import type { CommandResult } from '../command/utils/types'
import { overlayBase } from '@/utils/tldraw'

// ── Types ──────────────────────────────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

// ── Hook: Web Speech API ───────────────────────────────────────────────────
function useVoiceRecognition(onTranscript: (text: string) => void) {
  const recognitionRef = useRef<unknown>(null)
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>)['SpeechRecognition'] ||
      (window as unknown as Record<string, unknown>)['webkitSpeechRecognition']

    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new (SpeechRecognition as new () => {
      continuous: boolean
      interimResults: boolean
      lang: string
      onresult: (e: SpeechRecognitionEvent) => void
      onerror: (e: SpeechRecognitionErrorEvent) => void
      onend: () => void
      start(): void
      stop(): void
    })()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ')
        .trim()
      if (transcript) onTranscript(transcript)
    }

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error('Speech error:', e.error)
      setListening(false)
    }

    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
  }, [onTranscript])

  const toggleListening = useCallback(() => {
    const r = recognitionRef.current as { start(): void; stop(): void } | null
    if (!r) return
    if (listening) {
      r.stop()
      setListening(false)
    } else {
      r.start()
      setListening(true)
    }
  }, [listening])

  return { listening, supported, toggleListening }
}

// ── Main Component ─────────────────────────────────────────────────────────
function VoiceControlPanel() {
  const editor = useEditor()
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showFeedback = (text: string) => {
    setFeedback(text)
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = setTimeout(() => setFeedback(''), 5000)
  }

  const runTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return
    setLoading(true)

    try {
      const context = getCanvasContext(editor)

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, canvasContext: context }),
      })

      if (!res.ok) throw new Error('Agent API failed')

      const result: CommandResult = await res.json()

      for (const command of result.commands) {
        if (command.type !== 'UNKNOWN') {
          executeCommand(editor, command)
        }
      }

      showFeedback(result.feedback)
    } catch (err) {
      console.error(err)
      showFeedback("Sorry, something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }, [editor])

  const { listening, supported, toggleListening } = useVoiceRecognition(runTranscript)

  // Keyboard shortcut: Space to toggle mic
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.shiftKey) {
        e.preventDefault()
        toggleListening()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleListening])

  const handleTextRun = () => {
    runTranscript(input)
    setInput('')
  }

  return (
    <>
      {/* Caption window — top center */}
      {(feedback || loading) && (
        <div style={{
          ...overlayBase,
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 480,
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 12,
          fontSize: 14,
          lineHeight: 1.5,
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
          textAlign: 'center',
        }}>
          {loading ? '🎧 Processing...' : feedback}
        </div>
      )}

      {/* Mic button — bottom right */}
      {supported && (
        <button
          onClick={toggleListening}
          title="Shift+Space to toggle"
          style={{
            ...overlayBase,
            bottom: 90,
            right: 16,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: listening ? '#ef4444' : '#0066cc',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: listening
              ? '0 0 0 4px rgba(239,68,68,0.3)'
              : '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'background 0.2s, box-shadow 0.2s',
            pointerEvents: 'auto',
          }}>
          {listening ? '⏹' : '🎙'}
        </button>
      )}

      {/* Text input — bottom left (temp dev tool, can remove later) */}
      <div style={{
        ...overlayBase,
        bottom: 90,
        left: 16,
        display: 'flex',
        gap: 8,
        pointerEvents: 'auto',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTextRun()}
          placeholder="Type or use mic (Shift+Space)"
          disabled={loading}
          style={{
            padding: '8px 12px',
            fontSize: 13,
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#fff',
            width: 260,
            outline: 'none',
          }}
        />
        <button
          onClick={handleTextRun}
          disabled={loading}
          style={{
            padding: '8px 14px',
            background: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 13,
            opacity: loading ? 0.6 : 1,
          }}>
          Run
        </button>
      </div>

      {!supported && (
        <div style={{
          ...overlayBase,
          bottom: 90,
          right: 16,
          fontSize: 12,
          color: '#999',
          background: '#fff',
          padding: '6px 10px',
          borderRadius: 8,
          pointerEvents: 'none',
        }}>
          Voice: use Chrome/Edge
        </div>
      )}
    </>
  )
}

export default VoiceControlPanel