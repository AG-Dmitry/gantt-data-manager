import { Color } from './constants';
import { entryNode, ganttElement } from './types';

/**
 * Create data object used in UI.
 * @param {string} name Name of task.
 * @param {Date} start Task start date.
 * @param {Date} end Task end date.
 * @param {string[] | null} parents Array of parent node names.
 * @param {string[] | null} children Array of children node names.
 * @param {Date | null} overlappingStart Displays task start date specified by user in case it was overwritten in process of graph building.
 * @returns {number} Gantt element data object used in UI.
 */
const createGanttElement = (
  name: string,
  start: Date,
  end: Date,
  parents: Set<string> | null,
  children: Set<string> | null,
  color: Color,
  overlappingStart: Date | null
): ganttElement => {
  return {
    name: name,
    start: start,
    end: end,
    parents: parents,
    children: children,
    color: color,
    overlappingStart: overlappingStart,
  };
};

/**
 * Settle order of nodes displayed in UI. First nodes with no children will be displayed above other tasks of the same parent. Then nodes with later end date will be displayed above other tasks of the same parent.
 * @param {string} a First element to sort.
 * @param {string} b Second element to sort.
 * @returns {number} Sorting order value for JS built in sort() method.
 */
const sortGanttElements = (a: ganttElement, b: ganttElement): number => {
  if (a.children !== null && b.children === null) return 1;
  if (b.children !== null && a.children === null) return -1;
  if (a.end === b.end) return 0;
  if (a.end.getDate() - b.end.getDate() > 0) {
    return 1;
  } else return -1;
};

/**
 * Create complete hashmap for display in UI from graph using modified DFS algorythm.
 * @param {Map<string, entryNode>} adjList Adjacency list.
 * @param {string} rootName Root node name of adjacency list.
 * @param {Date} projectStart Start date of gantt diagram.
 * @param {string} initialNodeName Name of node from which gantt diagram should be build. Root node name by default.
 * @returns {Map<string, ganttElement>} Map of gantt elements.
 */
export const createRenderMap = (
  adjList: Map<string, entryNode>,
  rootName: string,
  projectStart: Date,
  initialNodeName: string = rootName
): Map<string, ganttElement> => {
  const dfsStack: string[] = [initialNodeName];
  const renderMap = new Map();
  const pendingMap = new Map();

  while (dfsStack.length > 0) {
    // repeats until no nodes in stack
    const currentNodeName: string | undefined = dfsStack.pop();
    const currentNode: entryNode | null =
      currentNodeName ? adjList.get(currentNodeName) ?? null : null;
    const currentProcessedElements: ganttElement[] = []; // array of sutable child nodes of current node

    currentNode?.children?.forEach((child) => {
      const childNode = adjList.get(child);
      if (!childNode) return; // Skip if child node doesn't exist
      const childNodeParents: Set<string> =
        childNode.parents !== null ? childNode.parents : new Set();

      if (
        childNodeParents.size === 1 ||
        (pendingMap.has(childNode.name) && pendingMap.get(childNode.name) === 1)
      ) {
        // add to map for display in UI and push to stack if entered from the last parent node
        let isStartOverlapping = false;

        const start: Date =
          currentNode.name === rootName
            ? new Date(projectStart.getTime())
            : new Date(
                Array.from(childNodeParents).reduce(
                  (max, current) => {
                    const parentNode = renderMap.get(current);
                    if (!parentNode) {
                      return projectStart.getTime();
                    }
                    return Math.max(max, parentNode.end.getTime());
                  },
                  0
                )
              );

        if (childNode.start !== null) {
          // checking if start date is specified by user
          if (childNode.start.getTime() >= start.getTime()) {
            // checking if start date specified by user is in valid range
            start.setTime(childNode.start.getTime());
          } else {
            isStartOverlapping = true;
          }
        }

        const end: Date = new Date(start.getTime());
        end.setDate(start.getDate() + childNode.duration);

        // add info from current node to hashmap for display in UI
        currentProcessedElements.push(
          createGanttElement(
            childNode.name,
            start,
            end,
            childNode.parents,
            childNode.children,
            childNode.color,
            isStartOverlapping ? childNode.start : null
          )
        );
      } else if (pendingMap.has(childNode.name)) {
        // if node has more than 1 unvisited parent node and is in pending map
        const currentCount = pendingMap.get(childNode.name);
        if (currentCount !== undefined) {
          pendingMap.set(childNode.name, currentCount - 1);
        }
      } else {
        // if node has more than 1 unvisited parent node and is not in pending map
        pendingMap.set(childNode.name, childNodeParents.size - 1);
      }
    });

    currentProcessedElements.sort(sortGanttElements);
    currentProcessedElements.forEach((element) => {
      if (element.children?.size) {
        dfsStack.push(element.name);
      }
      renderMap.set(element.name, element);
    });
  }

  return renderMap;
};
