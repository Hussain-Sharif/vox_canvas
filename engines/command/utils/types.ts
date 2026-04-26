export type ShapeColor =
  | 'red' | 'blue' | 'green' | 'yellow' | 'orange'
  | 'purple' | 'black' | 'white' | 'grey' | string // allows hex too

export type Command =
  | { type: 'CREATE_SHAPE'; shapeType: 'rectangle' | 'ellipse' | 'arrow' | 'text'; position: 'center' | 'cursor'; label?: string }
  | { type: 'SET_FILL'; target: 'selection' | 'all'; color: ShapeColor }
  | { type: 'SET_STYLE'; target: 'selection'; strokeWidth?: number; dash?: 'solid' | 'dashed' | 'dotted'; opacity?: number }
  | { type: 'ALIGN'; target: 'selection'; axis: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical' }
  | { type: 'DELETE'; target: 'selection' }
  | { type: 'GROUP'; target: 'selection' }
  | { type: 'UNGROUP'; target: 'selection' }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UNKNOWN'; reason: string } // LLM couldn't parse

export interface CommandResult {
  commands: Command[]
  feedback: string // what the AI says back to the user as caption text
}