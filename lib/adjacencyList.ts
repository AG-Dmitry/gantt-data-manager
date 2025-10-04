import { entryNode } from './types';
import { GraphError, Color, rootName } from './constants';

export interface IAdjacencyList {
  getDefaultColor(): Color;
  setDefaultColor(color: Color): void;
  getStartDate(): Date;
  setStartDate(startDate: Date): void;
  getRootName: () => string;
  getList: () => Map<string, entryNode>;
  getNodeCount(): number;
  getRemainingCapacity(): number;
  isAtCapacity(): boolean;
  addNode: (
    name?: string,
    duration?: number,
    parents?: string[] | null,
    children?: string[] | null,
    color?: Color,
    start?: Date | null
  ) => void;
  updateNode: (
    name: string,
    newName?: string,
    duration?: number,
    parents?: string[] | null,
    children?: string[] | null,
    color?: Color,
    start?: Date | null
  ) => void;
  removeNode: (name: string, isUpdate: boolean) => void;
}

export default class AdjacencyList implements IAdjacencyList {
  protected id: string;
  protected list: Map<string, entryNode>;
  protected defaultColor: Color;
  protected startDate: Date;
  protected rootName: string;
  private static readonly MAX_NODES = 10000; // Maximum number of nodes allowed in a single graph instance

  constructor(id: string, initialStartDate?: Date) {
    this.id = id;
    this.list = new Map();
    this.defaultColor = Color.Color1;
    this.startDate = initialStartDate ?? new Date();
    this.rootName = rootName;
    this.addNode(); // creating graph entry node
  }

  /**
   * Get default color of the graph.
   * @returns {Color} Default color of the graph.
   */
  getDefaultColor(): Color {
    return this.defaultColor;
  }

  /**
   * Set default color of the graph.
   * @param {Color} color Default color of the graph.
   * @returns {void}
   */
  setDefaultColor(color: Color): void {
    this.defaultColor = color;
  }

  /**
   * Get start date of gantt diagram.
   * @returns {Date} Start date of gantt diagram.
   */
  getStartDate(): Date {
    return this.startDate;
  }

  /**
   * Set start date of gantt diagram.
   * @param {Date} startDate Start date of gantt diagram.
   * @returns {void}
   */
  setStartDate(startDate: Date): void {
    this.startDate = startDate;
  }

  /**
   * Get root node name.
   * @returns {Map<string, entryNode>} Root node name.
   */
  getRootName(): string {
    return this.rootName;
  }

  /**
   * Get stored adjacency list.
   * @returns {Map<string, entryNode>} Adjacency list.
   */
  getList(): Map<string, entryNode> {
    return this.list;
  }

  /**
   * Get current node count in the graph.
   * @returns {number} Current number of nodes.
   */
  getNodeCount(): number {
    return this.list.size;
  }

  /**
   * Get remaining node capacity.
   * @returns {number} Number of nodes that can still be added.
   */
  getRemainingCapacity(): number {
    return AdjacencyList.MAX_NODES - this.list.size;
  }

  /**
   * Check if the graph has reached the maximum node limit.
   * @returns {boolean} True if at capacity, false otherwise.
   */
  isAtCapacity(): boolean {
    return this.list.size >= AdjacencyList.MAX_NODES;
  }

  /**
   * Adds new node to adjacency list.
   * @param {string} name Name of node to add.
   * @param {number} duration Number of days the task should last.
   * @param {string[] | null} parents Array of parent node names. Pass either null
   * or [] if empty.
   * @param {string[] | null} children Array of children node names. Pass either
   * null or [] if empty.
   * @param {Color} color Color of the node for UI representation.
   * @param {Date | null} start User specified start date. Overwritten if is before
   * calculated start.
   * @param {boolean} validate Flag to apply common validation. Passing this
   * parameter manually may cause data errors.
   * @returns {void}
   */
  addNode = (
    name: string = this.rootName,
    duration: number = 0,
    parents: string[] | null = null,
    children: string[] | null = null,
    color: Color = this.defaultColor,
    start: Date | null = null,
    validate: boolean = true
  ): void => {
    if (this.list.size >= AdjacencyList.MAX_NODES)
      throw GraphError.NodeLimitExceeded;
    if (this.list.has(name)) throw GraphError.EntryDuplicate;
    if (validate) this.runCommonValidation(name, duration, parents, children);

    if (parents === null && name !== this.rootName) parents = [this.rootName];

    this.list.set(name, {
      name: name,
      duration: duration,
      parents: parents ? new Set(parents) : null,
      children: children ? new Set(children) : null,
      color: color,
      start: start,
    });

    if (parents !== null) {
      parents.forEach((parent) => {
        this.bindChildNode(name, parent);
      });
    } // creating two-side binding with parents nodes
    if (children !== null)
      children.forEach((child) => {
        this.bindChildNode(child, name);
      }); // creating two-side binding with children nodes
  };

  /**
   * Updates node in adjacency list.
   * @param {string} name Current name of node to update.
   * @param {string} newName New name of updating node.
   * @param {number} duration Number of days the task should last.
   * @param {string[] | null} parents Array of parent node names. Pass either null
   * or [] if empty.
   * @param {string[] | null} children Array of children node names. Pass either
   * null or [] if empty.
   * @param {Color} color Color of the node for UI representation.
   * @param {Date | null} start User specified start date. Overwritten if is before
   * calculated start.
   * @returns {void}
   */
  updateNode = (
    name: string,
    newName: string = name,
    duration: number = this.list.get(name)?.duration ?? 0,
    parents: string[] | null = Array.from(this.list.get(name)?.parents ?? []),
    children: string[] | null = Array.from(this.list.get(name)?.children ?? []),
    color: Color = this.defaultColor,
    start: Date | null = this.list.get(name)?.start ?? null
  ): void => {
    if (name === this.rootName) throw GraphError.RootChange;
    if (this.list.has(newName) && newName !== name)
      throw GraphError.EntryDuplicate;
    if (!this.list.has(name)) throw GraphError.MissingEntry;
    this.runCommonValidation(name, duration, parents, children);

    if (parents?.length === 0) parents = null;
    if (children?.length === 0) children = null;
    this.removeNode(name, true);
    this.addNode(newName, duration, parents, children, color, start, false);
  };

  /**
   * Deletes node from adjacency list.
   * @param {string} name Name of node to delete.
   * @param {boolean} isUpdate True if called from update function. Prevents auto
   * relinking children and parent nodes.
   * @returns {void}
   */
  removeNode = (name: string, isUpdate: boolean = false): void => {
    if (name === this.rootName) throw GraphError.RootRemoval;
    if (!this.list.has(name)) throw GraphError.MissingEntry;

    const node = this.list.get(name);
    if (!node) throw GraphError.MissingEntry;
    const parents = Array.from(node.parents ?? []);
    const children = Array.from(node.children ?? []);
    const rootNode = this.list.get(this.rootName);

    parents.forEach((parent) => {
      this.unbindChildNode(name, parent); // removing links to current node in its
      // parent nodes
    });
    children.forEach((child) => {
      this.unbindChildNode(child, name); // removing links to current node in its
      // chilren nodes
      if (!isUpdate) {
        parents.forEach((parent) => {
          this.bindChildNode(child, parent);
        }); // mutualy reconnecting parent and children nodes of the current node
      }
    });
    this.list.delete(name);
    if (rootNode?.children) {
      rootNode.children.delete(name); // ensuring root node is disconnected
    }
  };

  protected bindChildNode = (
    childNodeName: string,
    nodeName: string = this.rootName
  ): void => {
    const node = this.list.get(nodeName);
    const childNode = this.list.get(childNodeName);
    if (!node || !childNode) return;

    if (node.children === null) node.children = new Set();
    node.children.add(childNodeName);
    if (childNode.parents === null) childNode.parents = new Set();
    childNode.parents.add(nodeName);
    this.ensureRootBinding(childNodeName); // ensuring correct connections to root node after changes
  };

  protected unbindChildNode = (
    childNodeName: string,
    nodeName: string = this.rootName
  ): void => {
    const node = this.list.get(nodeName);
    const childNode = this.list.get(childNodeName);
    if (!node || !childNode) return;

    node.children?.delete(childNodeName);
    if (node.children?.size === 0) node.children = null;
    childNode.parents?.delete(nodeName);
    if (nodeName !== this.rootName) {
      this.ensureRootBinding(childNodeName); // ensuring correct connections to root node after changes
    }
  };

  // ensuring correct connections to root node after changes in any connections made
  protected ensureRootBinding = (nodeName: string): void => {
    if (nodeName === this.rootName) return;
    const node = this.list.get(nodeName);
    const rootNode = this.list.get(this.rootName);
    if (!node || !rootNode) return;

    if (node.parents?.size && node.parents.size > 1) {
      node.parents.delete(this.rootName);
      rootNode.children?.delete(nodeName);
    }
    if (node.parents?.size === 0) {
      node.parents.add(this.rootName);
      if (rootNode.children === null) {
        rootNode.children = new Set();
      }
      rootNode.children.add(nodeName);
    }
  };

  // common checks for adding and updating etries
  protected runCommonValidation = (
    name: string,
    duration: number,
    parents: string[] | null,
    children: string[] | null
  ): void => {
    if (name.length === 0) throw GraphError.EmptyName;
    if (duration === 0 && name !== this.rootName) throw GraphError.ZeroDuration;
    if (duration < 0) throw GraphError.NegativeDuration;
    if (parents !== null)
      parents.forEach((parent) => {
        if (!this.list.has(parent)) throw GraphError.MissingParent;
        if (name === parent) throw GraphError.SelfReference;
      });
    if (children !== null)
      children.forEach((child) => {
        if (!this.list.has(child)) throw GraphError.MissingChild;
        if (name === child) throw GraphError.SelfReference;
        if (child === this.rootName) throw GraphError.RootReference;
      });
    if (this.findLoop(parents, children)) throw GraphError.GraphLoop;
  };

  protected findLoop = (
    parents: string[] | null,
    children: string[] | null
  ): boolean => {
    if (parents === null || children === null) return false;

    const dfsStack: string[] = new Array(...children);
    const visited: Set<string> = new Set();
    const parentSet: Set<string> = new Set(parents);

    while (dfsStack.length > 0) {
      const current: string = dfsStack.pop() as string;
      const currentChildren: Set<string> | null =
        this.list.get(current)?.children ?? null;

      if (parentSet.has(current)) {
        return true;
      }
      visited.add(current);

      if (currentChildren !== null) {
        currentChildren?.forEach((child) => {
          if (!visited.has(child)) dfsStack.push(child);
        });
      }
    }
    return false;
  };
}
