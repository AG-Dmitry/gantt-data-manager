import AdjacencyList from './adjacencyList';
import { createRenderMap } from './renderMap';
import { validateInput, validateDateForStorage } from './modules/inputSecurity';
import { getMaxLsp } from './modules/kmpSearch';
import { ApiError, Color } from './constants';
import { ganttElement, entryNode } from './types';

// ==================== API ====================

/**
 * Create new gantt graph data object.
 * @param {string} id Unique identifier of gantt graph.
 * @param {Date | undefined} startDate Start date of gantt graph in ISO format or
 * Date object. If not provided, current date will be used.
 * @returns {AdjacencyList} Gantt graph data object.
 * @throws {Error} Throws an error if failed to create gantt chart graph.
 */
export const createGanttGraph = (
  id: string,
  startDate?: Date
): AdjacencyList => {
  try {
    const validatedId = validateInput(id, { maxLength: 100, allowHtml: false });
    const validatedStartDate = startDate
      ? validateDateForStorage(startDate)
      : new Date();
    return new AdjacencyList(validatedId, validatedStartDate);
  } catch (error) {
    throw new Error(ApiError.GraphCreation + error);
  }
};

/**
 * Get start date of gantt graph.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @returns {Date} Start date of gantt graph.
 */
export const getStartDate = (graph: AdjacencyList): Date => {
  return graph.getStartDate();
};

/**
 * Set start date of gantt graph.
 * @param graph Gantt graph data object.
 * @param startDate Start date of gantt graph in ISO format or Date object.
 * @returns {void}
 * @throws {Error} Throws an error if failed to set new start date for gantt chart
 * graph.
 */
export const setStartDate = (graph: AdjacencyList, startDate: Date): void => {
  try {
    const validatedStartDate = validateDateForStorage(startDate);
    graph.setStartDate(validatedStartDate);
  } catch (error) {
    throw new Error(ApiError.StartDateSetting + error);
  }
};

/**
 * Get default color of gantt graph.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @returns {Color} Default color of gantt graph.
 */
export const getDefaultColor = (graph: AdjacencyList): Color => {
  return graph.getDefaultColor();
};

/**
 * Set default color of gantt graph.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @param {Color} color Default color of gantt graph.
 * @returns {void}
 * @throws {Error} Throws an error if failed to set new default color for gantt
 * chart graph.
 */
export const setDefaultColor = (graph: AdjacencyList, color: Color): void => {
  try {
    if (Object.values(Color).includes(color)) graph.setDefaultColor(color);
  } catch (error) {
    throw new Error(ApiError.DefaultColorSetting + error);
  }
};

/**
 * Generate render map for gantt chart graph.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @returns {Map<string, ganttElement>} Render map for gantt chart graph.
 * @throws {Error} Throws an error if failed to generate render map for gantt chart
 * graph.
 */
export const generateRenderMap = (graph: AdjacencyList): Map<string, ganttElement> => {
  try {
    return createRenderMap(
      graph.getList(),
      graph.getRootName(),
      graph.getStartDate()
    );
  } catch (error) {
    throw new Error(ApiError.RenderMapGeneration + error);
  }
};

/**
 * Get relevant task name list for user search request.
 * @param {string} pattern Pattern to search for.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @returns {string[]} Relevant task name list for user search request.
 */
export const getRelevantTaskNameList = (
  pattern: string,
  graph: AdjacencyList
): string[] => {
  const validatedPattern = validateInput(pattern, {
    maxLength: 100,
    allowHtml: false,
  });
  const relevantTaskNameList: string[] = [];
  const graphTaskList = graph.getList();
  for (const [taskName, _] of graphTaskList) {
    const maxLsp = getMaxLsp(validatedPattern, taskName);
    if (maxLsp === validatedPattern.length && taskName !== graph.getRootName())
      relevantTaskNameList.push(taskName);
  }
  return relevantTaskNameList;
};

/**
 * Put task into gantt chart graph.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @param {string} name Name of task.
 * @param {number | null} duration Duration of task.
 * @param {string | null} parent Parent of task.
 * @param {Date | null} start Start date of task.
 * @param {Date | null} end End date of task.
 * @param {Color | undefined} color Color of task.
 * @returns {void}
 */
export const putTask = (
  graph: AdjacencyList,
  name: string,
  duration: number | null = null,
  parent: string | null = null,
  start: Date | null = null,
  end: Date | null = null,
  color: Color | undefined = undefined
): void => {
  try {
    const validatedName = validateInput(name, {
      maxLength: 100,
      allowHtml: false,
    });
    let validatedDuration: number;
    if (start !== null && end !== null && start <= end) {
      // Calculate duration from start and end dates
      // +1 includes both start and end days (e.g., Mon-Fri = 5 days)
      const diffTime = end.getTime() - start.getTime();
      validatedDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
      validatedDuration = duration ?? 1;
    }
    const parents = parent
      ? [
          validateInput(parent, {
            maxLength: 100,
            allowHtml: false,
          }),
        ]
      : null;
    const children = null;
    const validatedColor =
      color && Object.values(Color).includes(color) ? color : undefined;
    const validatedStart = start ? validateDateForStorage(start) : null;
    graph.addNode(
      validatedName,
      validatedDuration,
      parents,
      children,
      validatedColor,
      validatedStart
    );
  } catch (error) {
    throw new Error(ApiError.TaskPutting + error);
  }
};

/**
 * Get task from gantt chart graph.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @param {string} name Name of task.
 * @returns {entryNode | undefined} Task from gantt chart graph.
 */
export const getTask = (graph: AdjacencyList, name: string): entryNode | undefined => {
  try {
    return graph.getList().get(name);
  } catch (error) {
    throw new Error(ApiError.TaskGetting + error);
  }
};

/**
 * Update task in gantt chart graph.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @param {string} name Name of task.
 * @param {string | undefined} newName New name of task.
 * @param {number | null} duration Duration of task.
 * @param {string[] | null} parents Parents of task.
 * @param {string[] | null} children Children of task.
 * @param {Date | null} start Start date of task.
 * @param {Date | null} end End date of task.
 * @param {Color | undefined} color Color of task.
 * @returns {void}
 */
export const updateTask = (
  graph: AdjacencyList,
  name: string,
  newName: string | undefined = undefined,
  duration: number | null = null,
  parents: string[] | null = null,
  children: string[] | null = null,
  start: Date | null = null,
  end: Date | null = null,
  color: Color | undefined = undefined
): void => {
  try {
    const validatedName = validateInput(name, {
      maxLength: 100,
      allowHtml: false,
    });
    const validatedNewName = newName
      ? validateInput(newName, {
          maxLength: 100,
          allowHtml: false,
        })
      : undefined;
    let validatedDuration: number;
    if (start !== null && end !== null && start <= end) {
      // Calculate duration from start and end dates
      // +1 includes both start and end days (e.g., Mon-Fri = 5 days)
      const diffTime = end.getTime() - start.getTime();
      validatedDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
      validatedDuration = duration ?? 1;
    }
    const validatedParents = parents
      ? parents.map((parent) =>
          validateInput(parent, {
            maxLength: 100,
            allowHtml: false,
          })
        )
      : null;
    const validatedChildren = children
      ? children.map((child) =>
          validateInput(child, {
            maxLength: 100,
            allowHtml: false,
          })
        )
      : null;
    const validatedColor =
      color && Object.values(Color).includes(color) ? color : undefined;
    const validatedStart = start ? validateDateForStorage(start) : null;
    graph.updateNode(
      validatedName,
      validatedNewName,
      validatedDuration,
      validatedParents,
      validatedChildren,
      validatedColor,
      validatedStart
    );
  } catch (error) {
    throw new Error(ApiError.TaskUpdating + error);
  }
};

/**
 * Delete task from gantt chart graph.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @param {string} name Name of task.
 * @returns {void}
 * @throws {Error} Throws an error if failed to delete task from gantt chart graph.
 */
export const deleteTask = (graph: AdjacencyList, name: string): void => {
  try {
    const validatedName = validateInput(name, {
      maxLength: 100,
      allowHtml: false,
    });
    graph.removeNode(validatedName);
  } catch (error) {
    throw new Error(ApiError.TaskDeleting + error);
  }
};

/**
 * Get current node count in the graph.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @returns {number} Current number of nodes.
 */
export const getTasksCount = (graph: AdjacencyList): number => {
  return graph.getNodeCount();
};

/**
 * Get remaining node capacity.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @returns {number} Number of nodes that can still be added.
 */
export const getRemainingCapacity = (graph: AdjacencyList): number => {
  return graph.getRemainingCapacity();
};

/**
 * Check if the graph has reached the maximum node limit.
 * @param {AdjacencyList} graph Gantt graph data object.
 * @returns {boolean} True if at capacity, false otherwise.
 */
export const isAtCapacity = (graph: AdjacencyList): boolean => {
  return graph.isAtCapacity();
};