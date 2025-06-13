import * as dnd from '@types/react-beautiful-dnd';

declare module '@hello-pangea/dnd' {
  export const DragDropContext: typeof dnd.DragDropContext;
  export const Droppable: typeof dnd.Droppable;
  export const Draggable: typeof dnd.Draggable;
  export type DropResult = dnd.DropResult;
  export type DroppableProvided = dnd.DroppableProvided;
  export type DraggableProvided = dnd.DraggableProvided;
} 