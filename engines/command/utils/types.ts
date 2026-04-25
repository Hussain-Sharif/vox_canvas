import { FillColors } from "../../canvas/types";


export type Command =
  | { type: 'CREATE_RECT'; position: 'center' | 'cursor' }
  | { type: 'CREATE_TEXT'; content: string; position: 'cursor' | 'center' }
  | { type: 'SET_FILL'; target: 'selection'; color: FillColors }
  | { type: 'ALIGN'; target: 'selection'; axis: 'horizontal' | 'vertical' };
  // later: | { type: 'AUTO_LAYOUT'; target: 'selection' } etc.