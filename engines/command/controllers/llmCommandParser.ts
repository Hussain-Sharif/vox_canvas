
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { CanvasContext } from '../../canvas/utils/getCanvasContext'
import { CommandResult } from '../utils/types'

// This is your Command schema described for the LLM using Zod
const CommandSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('CREATE_SHAPE'),
    shapeType: z.enum(['rectangle', 'ellipse', 'arrow', 'text']),
    position: z.enum(['center', 'cursor']),
    label: z.string().optional(),
  }),
  z.object({
    type: z.literal('SET_FILL'),
    target: z.enum(['selection', 'all']),
    color: z.string().describe('Color name like red, blue or hex like #ff0000'),
  }),
  z.object({
    type: z.literal('SET_STYLE'),
    target: z.enum(['selection']),
    strokeWidth: z.number().optional(),
    dash: z.enum(['solid', 'dashed', 'dotted']).optional(),
    opacity: z.number().min(0).max(1).optional(),
  }),
  z.object({
    type: z.literal('ALIGN'),
    target: z.enum(['selection']),
    axis: z.enum(['left', 'right', 'top', 'bottom', 'center-horizontal', 'center-vertical']),
  }),
  z.object({ type: z.literal('DELETE'), target: z.enum(['selection']) }),
  z.object({ type: z.literal('GROUP'), target: z.enum(['selection']) }),
  z.object({ type: z.literal('UNGROUP'), target: z.enum(['selection']) }),
  z.object({ type: z.literal('SELECT_ALL') }),
  z.object({ type: z.literal('DESELECT') }),
  z.object({ type: z.literal('UNDO') }),
  z.object({ type: z.literal('REDO') }),
  z.object({ type: z.literal('UNKNOWN'), reason: z.string() }),
])

const CommandResultSchema = z.object({
  commands: z.array(CommandSchema).describe('List of canvas actions to perform in order'),
  feedback: z.string().describe('Short acknowledgement to show the user as a caption, max 2 sentences'),
})

export async function llmParseCommand(
  transcript: string,
  canvasContext: CanvasContext
): Promise<CommandResult> {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'), // cheap + fast, perfect for this
    schema: CommandResultSchema,
    system: `You are a drawing assistant for an infinite canvas app.
Your job is to translate the user's voice command into a list of canvas actions.

Available actions you can return:
- CREATE_SHAPE: create shapes (rectangle, ellipse, arrow, text)
- SET_FILL: change fill color of selected or all shapes
- SET_STYLE: change stroke, dash, opacity of selected shapes
- ALIGN: align selected shapes (left/right/top/bottom/center-horizontal/center-vertical)
- DELETE: delete selected shapes
- GROUP/UNGROUP: group or ungroup selected shapes
- SELECT_ALL / DESELECT: change selection
- UNDO / REDO: undo or redo
- UNKNOWN: if the command is unclear or impossible

Rules:
- You can return MULTIPLE commands for a single request (e.g. "create a red rectangle" → CREATE_SHAPE + SET_FILL)
- Always provide a short, warm "feedback" message like "Got it! Created a red rectangle." 
- For color, return the tldraw color name (red, blue, green, yellow, orange, violet, black, grey, white) or hex
- If user says "this" or "these", they mean the current selection`,
    prompt: `Canvas context: ${JSON.stringify(canvasContext)}
User said: "${transcript}"`,
  })

  return object as CommandResult
}