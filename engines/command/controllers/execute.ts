import type { Editor } from 'tldraw'   // or @tldraw/editor
import { Command } from '../utils/types'


export function executeCommand(editor: Editor, command: Command) {
  switch (command.type) {
    case 'CREATE_SHAPE': {
      const screenPoint =
        command.position === 'cursor'
          ? editor.inputs.getCurrentScreenPoint()   // or getCurrentPagePoint 
          : editor.getViewportScreenCenter()

      const pagePoint = editor.screenToPage(screenPoint)

      editor.createShape({
        type: 'geo',
        x: pagePoint.x,
        y: pagePoint.y,
        props: { geo: 'rectangle', w: 150, h: 100 },
      })
      break
    }

    case 'SET_FILL': {
      const ids = editor.getSelectedShapeIds()
      // update props of each selected shape
      ids.forEach(id => {
        editor.updateShape({
          id,
          type: 'geo',
          props: { fill: 'solid', color: command.color },
        })
      })
      break
    }

    case 'ALIGN': {
      const ids = editor.getSelectedShapeIds()
      if (!ids.length) return
      if (command.axis === 'horizontal') {
        editor.alignShapes(ids, 'center-horizontal')
      } else {
        editor.alignShapes(ids, 'center-vertical')
      }
      break
    }

    // more cases later...
  }
}