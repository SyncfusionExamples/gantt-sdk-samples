# Syncfusion React Gantt — Virtualization Demo

A high-performance Gantt chart sample that demonstrates Syncfusion's React Gantt component **smoothly rendering 50,000 to 100,000 hierarchical tasks** using built-in virtualization.

## ✨ Features Demonstrated

- **Row virtualization** (`enableVirtualization`) — only visible rows are rendered in the DOM
- **Timeline virtualization** (`enableTimelineVirtualization`) — only visible date cells render
- **Auto date scheduling** toggle (`autoCalculateDateScheduling`) — automatically reschedules dependent tasks
- **Inline editing, row selection, tree expand/collapse** working alongside virtualization
- **Performance benchmarking** via the `dataBound` event with a 5-second safety fallback

## 🚀 Run Locally

```bash
npm install
npm start
```

Open `http://localhost:3000` in your browser, then use the **Dataset** dropdown in the status bar to load 50K / 75K / 100K records.

## 📂 Project Structure

```
public/index.html   - Page shell + Syncfusion Tailwind theme
src/index.js        - Gantt component + virtual data generator
src/data.js         - Sample datasets (projectNewData, zoomingData, etc.)
src/index.css       - Status-bar styling
```

## ⚙️ How It Works

1. The user picks a dataset size from the dropdown (50K / 75K / 100K).
2. `generateVirtualData()` builds a hierarchical task tree on the fly — each parent project gets 20 child tasks arranged in 4 sets of 5.
3. The `<GanttComponent>` is **re-mounted** via a `key` change so VirtualScroll rebuilds cleanly.
4. The `dataBound` callback fires once rendering is complete; the elapsed time (in seconds) is displayed in the status bar.
5. The **"Loaded: N records"** badge appears only after `dataBound` fires and the dataset is non-empty, avoiding premature UI claims.

## 🌐 Tech Stack

- React 18.1
- JavaScript (ES2020)
- Syncfusion EJ2 React Gantt 34.2.4
- Create React App

## 📜 License

This sample uses Syncfusion EJ2 packages. Ensure you have a valid Syncfusion license (Community or Commercial) for production usage.