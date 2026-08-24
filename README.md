# Syncfusion<sup>®</sup> Gantt SDK Samples

A curated collection of **Syncfusion<sup>®</sup> Gantt SDK** component samples. The
Syncfusion Gantt SDK combines the [Gantt Chart](#-featured-components) and
[Kanban](#-featured-components) components to help teams plan, track, and manage
work with clarity — whether you need timeline-based project scheduling or
board-based task management. Each sample in this repository is a small,
self-contained project that demonstrates a specific feature or integration
pattern and serves as a perfect starting point for your own application.

> Official overview: <https://help.syncfusion.com/gantt-sdk/overview>

---

## Featured Components

### 1. Gantt Chart

A project management tool that provides a Microsoft Project-like interface for
scheduling and managing projects. Its intuitive UI lets you visually manage
tasks, task relationships, and resources in a project.

**Key features**

- **Data sources** — Bind the Grid component with an array of JSON objects or `DataManager`.
- **Large data binding** — Render a large number of tasks with effective performance. Load parent records at load time; child records render on demand during expansion.
- **Editing** — Edit task fields such as duration, start date, end date, and predecessors directly in cells, the Edit dialog, or interactively via taskbars.
- **Undo/Redo** — Revert the most recent action or reapply a previous one.
- **Task dependencies** — Define task relationships: finish-to-start, start-to-finish, start-to-start, finish-to-finish.
- **Customizable timeline** — Display timescale from minutes to decades with custom texts; one-tier or two-tier layout.
- **Taskbars** — Support unscheduled tasks, customize taskbars, and display baselines.
- **Critical path** — Highlight the chain of tasks that controls the calculated finish date of the project.
- **Timezone** — Schedule projects in their respective timezones.
- **Columns** — Customize columns and add custom columns at initialization.
- **Resources** — Show and allocate staff, equipment, materials, and more for each task.
- **Filtering** — Filter individual columns using menu filtering along with the toolbar search box.
- **Toolbar** — Manage Gantt data using toolbars.
- **Rows** — Customize rows and add custom rows at initialization or dynamically.
- **Selection** — Customize row and cell selection at initialization or dynamically.
- **Data markers / indicators** — Display indicators and flags along with taskbars and task labels.
- **Event markers** — Highlight important days or events using event markers.
- **Holidays** — Define non-working days in a project.

### 2. Kanban

A task management component used to plan, track, and organize work items in a
board format. Teams can move cards across columns to reflect progress while
maintaining work statuses and priorities.

**Key features**

- **Data binding** — Bind to local or remote data sources so cards stay in sync with your application data.
- **Customizable columns** — Define and configure columns to match workflow stages, status values, and board structure.
- **Sorting** — Arrange cards in ascending or descending order by fields such as priority, due date, or status.
- **Virtual scrolling** — Load and render only the visible cards while scrolling to improve performance with large data sets.
- **Card editing / CRUD operations** — Add, update, and remove cards directly from the board.
- **Card templates** — Customize card appearance to display the exact content and layout needed for each work item.
- **Swimlane layouts** — Group cards into swimlanes by category, assignee, priority, or any other relevant field.

---

## Sample Catalog

| Platform | Sample | Folder | Component | Demonstrates |
|---|---|---|---|---|
| React | Virtual Scrolling with Large Dataset | [react-gantt/virtual-scrolling-large-dataset](react-gantt/virtual-scrolling-large-dataset) | Gantt Chart | Row & timeline virtualization with **50K – 100K** hierarchical tasks, auto date scheduling, inline editing, and performance benchmarking |

---