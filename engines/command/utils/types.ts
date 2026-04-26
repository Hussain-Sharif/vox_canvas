export type Command = {
  type:
    | 'CREATE_SHAPE' | 'SET_FILL' | 'SET_STYLE' | 'ALIGN'
    | 'DELETE' | 'GROUP' | 'UNGROUP' | 'SELECT_ALL'
    | 'DESELECT' | 'UNDO' | 'REDO' | 'UNKNOWN'
  shapeType: 'rectangle' | 'ellipse' | 'arrow' | 'text' | null
  position: 'center' | 'cursor' | null
  label: string | null
  target: 'selection' | 'all' | null
  color: string | null
  strokeWidth: number | null
  dash: 'solid' | 'dashed' | 'dotted' | null
  opacity: number | null
  axis: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical' 
  reason: string | null
}

export type CommandResult = {
  commands: Command[]
  feedback: string
}