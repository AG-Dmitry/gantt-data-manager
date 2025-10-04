# Gantt Data Manager

A comprehensive TypeScript library for managing Gantt chart data structures with advanced task scheduling, dependency management, and intelligent search capabilities.

## Overview

The Gantt Data Manager provides a robust foundation for building Gantt chart applications. It offers secure input validation, efficient graph-based task management, intelligent task search using KMP algorithm, and optimized rendering capabilities.

## Key Features

- **🔒 Security-First Design**: Built-in XSS protection and input sanitization
- **📊 Graph-Based Architecture**: Efficient adjacency list implementation for complex task dependencies
- **🔍 Intelligent Search**: KMP algorithm for fast pattern matching in task names
- **🎨 Visual Customization**: 10 predefined colors for task differentiation
- **📅 Date Management**: Comprehensive date validation and scheduling
- **⚡ Performance Optimized**: Tree-shaken codebase with minimal bundle size

## Installation

Add to the modules of your project manually.

**Version:** 1.0.0  
**Node.js:** >=14.0.0  
**TypeScript:** >=4.0.0

## Quick Start

```typescript
import { 
  createGanttGraph, 
  putTask, 
  generateRenderMap, 
  Color 
} from 'gantt-data-manager';

// Create a new Gantt chart
const chart = createGanttGraph('project-1', new Date('2026-01-01'));

// Add tasks with dependencies
putTask(chart, 'Design Phase', 5, null, new Date('2026-01-01'), new Date('2026-01-05'), Color.Color1);
putTask(chart, 'Development', 10, 'Design Phase', new Date('2026-01-06'), new Date('2026-01-15'), Color.Color2);

// Generate render data for UI
const renderData = generateRenderMap(chart);
```

## API Reference

### Core Functions

#### `createGanttGraph(id: string, startDate?: Date): AdjacencyList`

Creates a new Gantt chart instance.

**Parameters:**
- `id`: Unique identifier for the chart (max 100 chars)
- `startDate`: Optional start date (defaults to current date)

**Returns:** AdjacencyList instance

**Example:**
```typescript
const chart = createGanttGraph('my-project', new Date('2026-01-01'));
```

#### `putTask(graph, name, duration?, parent?, start?, end?, color?)`

Adds a new task to the Gantt chart.

**Parameters:**
- `graph`: AdjacencyList instance
- `name`: Task name (max 100 chars)
- `duration`: Task duration in days (optional)
- `parent`: Parent task name (optional)
- `start`: Start date (optional)
- `end`: End date (optional)
- `color`: Task color (optional)

**Example:**
```typescript
putTask(chart, 'Task 1', 5, null, new Date('2026-01-01'), new Date('2026-01-05'), Color.Color1);
putTask(chart, 'Task 2', 3, 'Task 1', new Date('2026-01-06'), new Date('2026-01-08'), Color.Color2);
```

#### `updateTask(graph, name, newName?, duration?, parents?, children?, start?, end?, color?)`

Updates an existing task.

**Parameters:**
- `graph`: AdjacencyList instance
- `name`: Current task name
- `newName`: New task name (optional)
- `duration`: New duration (optional)
- `parents`: Array of parent task names (optional)
- `children`: Array of child task names (optional)
- `start`: New start date (optional)
- `end`: New end date (optional)
- `color`: New color (optional)

#### `deleteTask(graph, name)`

Removes a task from the chart.

**Parameters:**
- `graph`: AdjacencyList instance
- `name`: Task name to delete

#### `getTasksCount(graph): number`

Gets the current number of tasks in the graph.

**Parameters:**
- `graph`: AdjacencyList instance

**Returns:** Number of tasks currently in the graph

#### `getRemainingCapacity(graph): number`

Gets the number of nodes that can still be added to the graph.

**Parameters:**
- `graph`: AdjacencyList instance

**Returns:** Number of nodes that can still be added (max 10,000)

#### `isAtCapacity(graph): boolean`

Checks if the graph has reached the maximum node limit.

**Parameters:**
- `graph`: AdjacencyList instance

**Returns:** True if at capacity (10,000 nodes), false otherwise

#### `getTask(graph, name)`

Retrieves a specific task.

**Parameters:**
- `graph`: AdjacencyList instance
- `name`: Task name

**Returns:** Task object or undefined

### Chart Management

#### `getStartDate(graph): Date`
Gets the chart's start date.

#### `setStartDate(graph, startDate): void`
Sets the chart's start date.

#### `getDefaultColor(graph): Color`
Gets the default color for new tasks.

#### `setDefaultColor(graph, color): void`
Sets the default color for new tasks.

### Rendering & Search

#### `generateRenderMap(graph): Map<string, ganttElement>`

Generates optimized render data for UI components.

**Returns:** Map with sorted task elements ready for display

#### `getRelevantTaskNameList(pattern, graph): string[]`

Searches for tasks matching a pattern using KMP algorithm.

**Parameters:**
- `pattern`: Search pattern
- `graph`: AdjacencyList instance

**Returns:** Array of task names that match the pattern

**Example:**
```typescript
const results = getRelevantTaskNameList('dev', chart);
// Returns array of task names containing 'dev'
```

## Data Types

### `entryNode`
```typescript
{
  name: string;
  duration: number;
  parents: Set<string> | null;
  children: Set<string> | null;
  color: Color;
  start: Date | null;
}
```

### `ganttElement`
```typescript
{
  name: string;
  start: Date;
  end: Date;
  parents: Set<string> | null;
  children: Set<string> | null;
  color: Color;
  overlappingStart: Date | null;
}
```

## Color System

The library provides 10 predefined colors:

```typescript
enum Color {
  Color1 = 1,
  Color2 = 2,
  Color3 = 3,
  Color4 = 4,
  Color5 = 5,
  Color6 = 6,
  Color7 = 7,
  Color8 = 8,
  Color9 = 9,
  Color10 = 10
}
```

## Security Features

- **Input Sanitization**: All user inputs are automatically sanitized
- **XSS Protection**: HTML characters are escaped by default
- **Length Validation**: Configurable input length limits (default: 100 characters)
- **Date Validation**: Comprehensive date format and range validation
- **Control Character Filtering**: Automatic removal of control characters and null bytes
- **HTML Escaping**: Complete HTML entity escaping for security

### Validation Options
```typescript
interface ValidationOptions {
  maxLength?: number;        // Default: 100
  allowHtml?: boolean;       // Default: false
  trimWhitespace?: boolean;  // Default: true
  allowEmptyString?: boolean; // Default: true
}
```

## Performance Optimizations

- **Tree Shaking**: Unused code is automatically removed
- **KMP Algorithm**: O(m+n) pattern matching for fast search
- **Efficient Data Structures**: Optimized adjacency list implementation
- **Early Termination**: Smart algorithms with early exit conditions
- **Memory Management**: 10,000 node limit per graph instance to prevent memory issues
- **Node Monitoring**: Built-in capacity tracking and remaining node count

## Error Handling

The library includes comprehensive error handling with specific error types:

### Graph Errors
```typescript
enum GraphError {
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
```

### API Errors
```typescript
enum ApiError {
  GraphCreation = 'Failed to create gantt chart graph: ',
  StartDateSetting = 'Failed to set new start date for gantt chart graph: ',
  DefaultColorSetting = 'Failed to set new default color for gantt chart graph: ',
  RenderMapGeneration = 'Failed to generate render map for gantt chart graph: ',
  TaskPutting = 'Failed to put task into gantt chart graph: ',
  TaskGetting = 'Failed to get task from gantt chart graph: ',
  TaskUpdating = 'Failed to update task in gantt chart graph: ',
  TaskDeleting = 'Failed to delete task from gantt chart graph: '
}
```

## Complete Example

```typescript
import { 
  createGanttGraph, 
  putTask, 
  updateTask, 
  deleteTask,
  generateRenderMap,
  getRelevantTaskNameList,
  getTasksCount,
  getRemainingCapacity,
  isAtCapacity,
  setStartDate,
  setDefaultColor,
  Color 
} from 'gantt-data-manager';

// Create project
const project = createGanttGraph('web-app-project');
setStartDate(project, new Date('2026-01-01'));
setDefaultColor(project, Color.Color1);

// Add tasks
putTask(project, 'Planning', 3, null, new Date('2026-01-01'), new Date('2026-01-03'), Color.Color1);
putTask(project, 'Design', 5, 'Planning', new Date('2026-01-04'), new Date('2026-01-08'), Color.Color2);
putTask(project, 'Development', 10, 'Design', new Date('2026-01-09'), new Date('2026-01-18'), Color.Color3);
putTask(project, 'Testing', 3, 'Development', new Date('2026-01-19'), new Date('2026-01-21'), Color.Color4);

// Update a task
updateTask(project, 'Development', 'Frontend Development', 8, ['Design'], null, new Date('2026-01-09'), new Date('2026-01-16'), Color.Color5);

// Search for tasks
const searchResults = getRelevantTaskNameList('dev', project);
console.log('Found tasks:', searchResults); // Returns array of matching task names

// Generate render data
const renderData = generateRenderMap(project);
console.log('Render data:', renderData);

// Check graph capacity
console.log('Current tasks:', getTasksCount(project));
console.log('Remaining capacity:', getRemainingCapacity(project));
console.log('Is at capacity?', isAtCapacity(project));

// Delete a task
deleteTask(project, 'Testing');
```

## Architecture

The library is built with a modular architecture:

- **`index.ts`**: Main API interface with comprehensive error handling
- **`adjacencyList.ts`**: Core graph data structure with interface implementation
- **`renderMap.ts`**: Rendering optimization for UI components
- **`modules/inputSecurity.ts`**: Security and validation with XSS protection
- **`modules/kmpSearch.ts`**: Pattern matching algorithms for fast search
- **`types/`**: TypeScript type definitions
- **`constants/`**: Enums and constants

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For issues and questions, please open an issue on the GitHub repository.
