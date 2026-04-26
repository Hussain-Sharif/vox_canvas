import type { Editor } from 'tldraw'

export interface ShapeInfo {
  id: string
  type: string
  label?: string
  color?: string
  x: number
  y: number
  w: number
  h: number
  selected: boolean
}

export interface CanvasContext {
  totalShapes: number
  selectedCount: number
  selectedShapes: ShapeInfo[]
  allShapes: ShapeInfo[]
}

export function getCanvasContext(editor: Editor): CanvasContext {
  const allShapes = editor.getCurrentPageShapes()
  const selectedIds = new Set(editor.getSelectedShapeIds())

  const toInfo = (s: typeof allShapes[0]): ShapeInfo => {
    const bounds = editor.getShapePageBounds(s)
    return {
      id: s.id,
      type: s.type,
      label: (s.props as Record<string, unknown>)['text'] as string | undefined,
      color: (s.props as Record<string, unknown>)['color'] as string | undefined,
      x: bounds?.x ?? 0,
      y: bounds?.y ?? 0,
      w: bounds?.w ?? 0,
      h: bounds?.h ?? 0,
      selected: selectedIds.has(s.id),
    }
  }

  const all = allShapes.map(toInfo)

  return {
    totalShapes: all.length,
    selectedCount: selectedIds.size,
    selectedShapes: all.filter(s => s.selected),
    allShapes: all,
  }
}