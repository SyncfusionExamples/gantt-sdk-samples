# Syncfusion Gantt SDK Samples

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![GitHub stars](https://img.shields.io/github/stars/SyncfusionExamples/gantt-sdk-samples?style=social)
![Issues](https://img.shields.io/github/issues/SyncfusionExamples/gantt-sdk-samples)

A curated collection of **Syncfusion EJ2 Gantt Chart** and **Kanban** component samples
across multiple JavaScript/TypeScript frameworks and .NET platforms. Each sample is a
small, self-contained project that demonstrates a specific feature or integration pattern —
perfect as a starting point for your own application.

---

## ✨ Featured Components

- **Gantt Chart** — task scheduling, dependencies, baselines, resource allocation, timelines, critical path, editing, sorting, filtering, and more.
- **Kanban** — workflow columns, swimlanes, WIP limits, drag-and-drop, card templates, and CRUD.

---

## 🧰 Supported Platforms

| Technology | Library |
|---|---|
| JavaScript | `@syncfusion/ej2-gantt`, `@syncfusion/ej2-kanban` |
| TypeScript | `@syncfusion/ej2-gantt`, `@syncfusion/ej2-kanban` |
| React | `@syncfusion/ej2-react-gantt`, `@syncfusion/ej2-react-kanban` |
| Angular | `@syncfusion/ej2-angular-gantt`, `@syncfusion/ej2-angular-kanban` |
| Vue | `@syncfusion/ej2-vue-gantt`, `@syncfusion/ej2-vue-kanban` |
| Blazor | `Syncfusion.Blazor.Gantt`, `Syncfusion.Blazor.Kanban` |
| ASP.NET Core | `Syncfusion.EJ2.AspNet.Core` |
| ASP.NET MVC | `Syncfusion.EJ2.MVC` |

---

## 📁 Repository Structure

```text
gantt-sdk-samples/
│
├── javascript/
│   ├── gantt-chart/
│   └── kanban/
│
├── typescript/
│   ├── gantt-chart/
│   └── kanban/
│
├── react/
│   ├── gantt-chart/
│   └── kanban/
│
├── angular/
│   ├── gantt-chart/
│   └── kanban/
│
├── vue/
│   ├── gantt-chart/
│   └── kanban/
│
├── blazor/
│   ├── gantt-chart/
│   └── kanban/
│
├── aspnetcore/
│   ├── gantt-chart/
│   └── kanban/
│
└── aspnetmvc/
    ├── gantt-chart/
    └── kanban/
```

Each top-level folder is a **separate sample** project. Navigate into one to run it
independently.

---

## 🚀 Getting Started

### Prerequisites

Pick the requirements that match the sample you want to run:

- **Node.js 18+** and **npm** (or **yarn** / **pnpm**) — for JavaScript, TypeScript, React, Angular, and Vue samples
- **.NET 8 SDK** — for Blazor, ASP.NET Core, and ASP.NET MVC samples
- **Angular CLI 17+** — only if you intend to modify/rebuild Angular samples
- **Syncfusion license key** — see the [License Registration](#-license-registration) section below

### Clone the repository

```bash
git clone https://github.com/SyncfusionExamples/gantt-sdk-samples.git
cd gantt-sdk-samples
```

### Run a sample

**JavaScript / TypeScript / React / Vue samples:**

```bash
cd react/gantt-chart
npm install
npm start
```

**Angular samples:**

```bash
cd angular/gantt-chart
npm install
ng serve
```

**Blazor / ASP.NET Core / ASP.NET MVC samples:**

```bash
cd blazor/gantt-chart
dotnet restore
dotnet run
```

---

## 📚 Sample Catalog

| Sample | Framework | Component | Demonstrates |
|---|---|---|---|
| `react/gantt-chart` | React | Gantt | Default rendering, data binding, editing |
| `react/kanban` | React | Kanban | Workflow columns, card templates |
| `angular/gantt-chart` | Angular | Gantt | Row drag-and-drop, timeline customization |
| `angular/kanban` | Angular | Kanban | Swimlanes, dialog editing |
| `vue/gantt-chart` | Vue | Gantt | Resource view, baselines |
| `vue/kanban` | Vue | Kanban | Drag-and-drop, search/filter |
| `blazor/gantt-chart` | Blazor | Gantt | Dependency editing, holidays |
| `blazor/kanban` | Blazor | Kanban | Swimlane templates, CRUD |
| `javascript/gantt-chart` | JavaScript | Gantt | Basic integration without a framework |
| `typescript/gantt-chart` | TypeScript | Gantt | Strict typed integration |
| `aspnetcore/gantt-chart` | ASP.NET Core | Gantt | Server-side data binding |
| `aspnetcore/kanban` | ASP.NET Core | Kanban | MVC tag-helper usage |
| `aspnetmvc/gantt-chart` | ASP.NET MVC | Gantt | Razor view integration |
| `aspnetmvc/kanban` | ASP.NET MVC | Kanban | Razor view integration |

> 💡 **Note:** Not every sample folder listed above may be present yet. Check the
> repository for the latest set, or open a request to add a new scenario.

---

## 🔑 License Registration

Syncfusion EJ2 components require a valid license key in production environments. Get a
free **Community License** if you're an individual developer or a small business
(<https://www.syncfusion.com/products/communitylicense>).

- **JavaScript / TypeScript / React / Angular / Vue** — register once before bootstrap:

  ```typescript
  import { registerLicense } from '@syncfusion/ej2-base';
  registerLicense('YOUR_LICENSE_KEY');
  ```

- **Blazor** — in `Program.cs` (Blazor WebAssembly / Server):

  ```csharp
  Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense("YOUR_LICENSE_KEY");
  ```

- **ASP.NET Core / ASP.NET MVC** — in `Startup.cs` or `Program.cs`:

  ```csharp
  Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense("YOUR_LICENSE_KEY");
  ```

> ⚠️ Trial license warnings will appear in the browser console if no key is registered.
> They disappear once a valid license is detected.

---

## 🛠️ Troubleshooting

| Issue | Fix |
|---|---|
| Chart/Kanban renders but shows a license watermark | Register a valid license key (see above). |
| `npm install` fails on Angular | Use Node 18+ and run `npm install --legacy-peer-deps`. |
| `dotnet restore` fails | Ensure .NET 8 SDK is installed (`dotnet --version`). |
| Samples missing styles | Confirm `ej2-base`/`ej2-buttons` CSS is referenced in the entry file. |

---

## 📖 Resources

- 📘 Gantt Chart and Kanban docs — <https://help.syncfusion.com/gantt-sdk/overview>
- 🎨 Live demos — <https://ej2.syncfusion.com/demos/>
- 🎥 Tutorials — <https://www.syncfusion.com/tutorials>
- 💬 Community forum — <https://www.syncfusion.com/forums/>
- 🛟 Support portal — <https://support.syncfusion.com/>

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-sample`.
3. Add your sample inside the matching platform folder, keeping the same structure
   (`<platform>/<component>/...`).
4. Run the sample locally and verify it builds without warnings.
5. Open a Pull Request describing the feature demonstrated.

Please keep samples **minimal and focused on a single feature**.

---

## 📄 License

This repository is released under the **MIT License** — see the [LICENSE](LICENSE) file
for details. Syncfusion EJ2 components themselves are governed by the Syncfusion
License Agreement; review it at <https://www.syncfusion.com/sales/license-agreement>.

---

## 🙌 Acknowledgements

Maintained by **Syncfusion Examples**. Thanks to all contributors who expand the
sample catalog!