import type { Editor, TLShapeId } from 'tldraw'
import { toRichText } from 'tldraw'
import type { Command } from '../utils/types'

export function executeCommand(editor: Editor, command: Command): void {
  switch (command.type) {

    case 'CREATE_SHAPE': {
      // In tldraw@4, inputs.currentPagePoint is already in page space
      const pt =
        command.position === 'cursor'
          ? editor.inputs.currentPagePoint
          : editor.getViewportPageBounds().center

      const { x, y } = pt

      if (command.shapeType === 'text') {
        editor.createShape({
          type: 'text',
          x: x - 75,
          y: y - 20,
          props: {
            richText: toRichText(command.label ?? 'Text'),
            size: 'm',
            color: 'black',
          },
        })
      } else if (command.shapeType === 'arrow') {
        editor.createShape({
          type: 'arrow',
          x: x - 75,
          y,
          props: {
            start: { x: 0, y: 0 },
            end: { x: 150, y: 0 },
            color: 'black',
          },
        })
      } else {
        editor.createShape({
          type: 'geo',
          x: x - 75,
          y: y - 50,
          props: {
            geo: command.shapeType as 'rectangle' | 'ellipse',
            w: 150,
            h: 100,
            color: 'black',
            fill: 'solid',
          },
        })
      }
      break
    }

    case 'SET_FILL': {
      const ids: TLShapeId[] =
        command.target === 'all'
          ? editor.getCurrentPageShapes().map(s => s.id)
          : editor.getSelectedShapeIds()

      if (!ids.length) return

      editor.run(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor.updateShapes(ids.map(id => ({
          id,
          type: editor.getShape(id)!.type,
          props: { color: command.color, fill: 'solid' },
        })) as any[])
      })
      break
    }

    case 'SET_STYLE': {
      const ids = editor.getSelectedShapeIds()
      if (!ids.length) return

      editor.run(() => {
        editor.updateShapes(
          ids.map(id => {
            const shape = editor.getShape(id)!
            const props: Record<string, unknown> = {}
            if (command.strokeWidth !== undefined) props['strokeWidth'] = command.strokeWidth
            if (command.dash !== undefined) props['dash'] = command.dash
            if (command.opacity !== undefined) props['opacity'] = command.opacity
            return { id, type: shape.type, props }
          })
        )
      })
      break
    }

    case 'ALIGN': {
      const ids = editor.getSelectedShapeIds()
      if (ids.length < 2) return
      editor.alignShapes(ids, command.axis)
      break
    }

    case 'DELETE': {
      const ids = editor.getSelectedShapeIds()
      if (!ids.length) return
      editor.deleteShapes(ids)
      break
    }

    case 'GROUP': {
      const ids = editor.getSelectedShapeIds()
      if (ids.length < 2) return
      editor.groupShapes(ids)
      break
    }

    case 'UNGROUP': {
      const ids = editor.getSelectedShapeIds()
      if (!ids.length) return
      editor.ungroupShapes(ids)
      break
    }

    case 'SELECT_ALL': {
      editor.selectAll()
      break
    }

    case 'DESELECT': {
      editor.selectNone()
      break
    }

    case 'UNDO': {
      editor.undo()
      break
    }

    case 'REDO': {
      editor.redo()
      break
    }

    case 'UNKNOWN': {
      break
    }
  }
}