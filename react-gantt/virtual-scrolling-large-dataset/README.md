# Virtual Scrolling with Large Dataset

A high-performance Gantt chart sample that demonstrates the Syncfusion React
Gantt component smoothly rendering **50,000 to 100,000** hierarchical tasks
using built-in virtualization.

> Back to [react-gantt/](../)
>
> Repo root: [gantt-sdk-samples](../../../README.md)

---

## Prerequisites

- **Node.js 18+**
- **npm 9+** (ships with Node 18)
- A valid Syncfusion license key — register once before bootstrap:

  ```typescript
  import { registerLicense } from '@syncfusion/ej2-base';
  registerLicense('YOUR_LICENSE_KEY');
  ```

  Get a free **Community License** at
  <https://www.syncfusion.com/products/communitylicense>.

---

## Run

```bash
npm install
npm start
```

Open <http://localhost:3000> in your browser, then use the **Dataset** dropdown
in the status bar to load **50K / 75K / 100K** records.

### Build for production

```bash
npm run build
```

Output is written to `build/` as a static bundle ready to deploy to any static
host (Vercel, Netlify, GitHub Pages, S3, IIS, etc.).

> Static CSS for the status bar is inlined inside `public/index.html` — do
> not add a `src/index.css` file; it will be ignored.

---

## Project Structure

```text
public/index.html   Page shell and inline status-bar styling
src/index.js        Gantt component and virtual data generator
src/data.js         Data definitions
package.json        Dependencies and scripts
```

---