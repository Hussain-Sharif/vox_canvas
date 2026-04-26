import { generateText, Output } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// ALL fields required, nullable instead of optional — OpenAI Structured Outputs rule
const CommandSchema = z.object({
  type: z.enum([
    'CREATE_SHAPE', 'SET_FILL', 'SET_STYLE', 'ALIGN',
    'DELETE', 'GROUP', 'UNGROUP', 'SELECT_ALL',
    'DESELECT', 'UNDO', 'REDO', 'UNKNOWN',
  ]),
  shapeType: z.enum(['rectangle', 'ellipse', 'arrow', 'text']).nullable(),
  position: z.enum(['center', 'cursor']).nullable(),
  label: z.string().nullable(),
  target: z.enum(['selection', 'all']).nullable(),
  color: z.string().nullable(),
  strokeWidth: z.number().nullable(),
  dash: z.enum(['solid', 'dashed', 'dotted']).nullable(),
  opacity: z.number().nullable(),
  axis: z.enum(['left', 'right', 'top', 'bottom', 'center-horizontal', 'center-vertical']).nullable(),
  reason: z.string().nullable(),
})

const ResultSchema = z.object({
  commands: z.array(CommandSchema),
  feedback: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const { transcript, canvasContext } = await req.json()

    const { output } = await generateText({
      model: openai('gpt-4o-mini'),
      output: Output.object({ schema: ResultSchema }),
      system: `You are VoxCanvas, a smart drawing assistant for an infinite canvas.
Translate the user's voice or text command into canvas actions.

Command types and required fields:
- CREATE_SHAPE: set shapeType (rectangle/ellipse/arrow/text), position (center/cursor), label if mentioned
- SET_FILL: set target (selection/all), color (red/blue/green/yellow/orange/violet/black/white/grey)
- SET_STYLE: set target=selection, set strokeWidth/dash/opacity as relevant
- ALIGN: set target=selection, set axis (left/right/top/bottom/center-horizontal/center-vertical)
- DELETE, GROUP, UNGROUP, SELECT_ALL, DESELECT, UNDO, REDO: no extra fields needed
- UNKNOWN: set reason

For ALL commands, set unused fields to null.
Return multiple commands for compound requests e.g. "create a red rectangle" → CREATE_SHAPE + SET_FILL.
Colors: red, blue, green, yellow, orange, violet, black, white, grey only.
feedback: 1 short friendly sentence.`,
      prompt: `Canvas: ${JSON.stringify(canvasContext)}\nCommand: "${transcript}"`,
    })

    return NextResponse.json(output)
  } catch (err) {
    console.error('[agent route]', err)
    return NextResponse.json(
      {
        commands: [{ type: 'UNKNOWN', shapeType: null, position: null, label: null, target: null, color: null, strokeWidth: null, dash: null, opacity: null, axis: null, reason: 'Server error' }],
        feedback: 'Something went wrong, try again.',
      },
      { status: 500 }
    )
  }
}