import { generateSecureRootName } from "../modules/rootNameGen";

export enum GraphError {
  RootChange = 'root name cannot be changed.',
  RootRemoval = 'root node cannot be removed.',
  EntryDuplicate = 'task name cannot be duplicated.',
  EmptyName = 'task name cannot be empty.',
  InvalidInput = 'invalid input.',
  ZeroDuration = 'task duration cannot be zero.',
  NegativeDuration = 'task duration cannot be negative.',
  MissingEntry = 'cannot find task with this name.',
  MissingParent = 'cannot find parent task with this name.',
  MissingChild = 'cannot find child task with this name.',
  SelfReference = 'task cannot be its own parent or child.',
  RootReference = 'root node cannot be a child.',
  GraphLoop = 'prevented operation that would cause a loop.',
  NodeLimitExceeded = 'maximum number of nodes (10,000) exceeded.'
}

export enum ApiError {
  GraphCreation = 'Failed to create gantt chart graph: ',
  StartDateSetting = 'Failed to set new start date for gantt chart graph: ',
  DefaultColorSetting = 'Failed to set new default color for gantt chart graph: ',
  RenderMapGeneration = 'Failed to generate render map for gantt chart graph: ',
  TaskPutting = 'Failed to put task into gantt chart graph: ',
  TaskGetting = 'Failed to get task from gantt chart graph: ',
  TaskUpdating = 'Failed to update task in gantt chart graph: ',
  TaskDeleting = 'Failed to delete task from gantt chart graph: ',
}

export enum Color {
  Color1 = 1,
  Color2 = 2,
  Color3 = 3,
  Color4 = 4,
  Color5 = 5,
  Color6 = 6,
  Color7 = 7,
  Color8 = 8,
  Color9 = 9,
  Color10 = 10,
}

export const rootName = generateSecureRootName();