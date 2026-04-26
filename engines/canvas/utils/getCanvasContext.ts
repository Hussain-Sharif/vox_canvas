import { Editor } from 'tldraw'

export interface CanvasContext {
  totalShapes: number
  selectedShapes: { id: string; type: string; label?: string; color?: string }[]
  allShapesSummary: string
}

export function getCanvasContext(editor: Editor): CanvasContext {
  const allShapes = editor.getCurrentPageShapes()
  const selectedShapes = editor.getSelectedShapes()

  return {
    totalShapes: allShapes.length,
    selectedShapes: selectedShapes.map(s => ({
      id: s.id,
      type: s.type,
      label: 'props' in s && typeof (s.props as any).text === 'string'
        ? (s.props as any).text
        : undefined,
      color: 'props' in s ? (s.props as any).color : undefined,
    })),
    allShapesSummary: `${allShapes.length} shapes on canvas, ${selectedShapes.length} selected`,
  }
}