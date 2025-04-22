MyFrontend
A Vite + React + TypeScript front‑end for a simple Tasks application backed by a .NET API. Uses Tailwind CSS for styling and React Router for client‑side routing.

🚀 Quick Start
Clone the repo
git clone https://github.com/<your‑org>/Test‑Project.git
cd Test‑Project/my‑frontend

Install dependencies
npm install

or
yarn

Environment variables
Create a .env.development at project root:

ini
Copy
Edit
VITE_API_URL=http://localhost:5294
(Adjust if your backend runs on a different URL/port.)

Run the dev server
npm run dev

or
yarn dev
Navigate to http://localhost:5173.

Build for production
npm run build

or
yarn build
The output will be in dist/.

Preview production build
npm run preview

or
yarn preview

📁 Folder Structure
my‑frontend/
├── public/ Static assets (favicon, robots.txt, etc.)
├── src/
│ ├── assets/ Images, fonts, SVGs
│ ├── components/ Reusable UI components (Buttons, Inputs…)
│ ├── pages/ Route “screens” (LoginPage, RegisterPage, TasksPage)
│ ├── services/ API wrapper functions (login, fetchTasks…)
│ ├── hooks/ Custom React hooks (useAuth, useTasks…)
│ ├── utils/ Pure helpers (formatters, validators…)
│ ├── App.tsx Route definitions & layout
│ ├── main.tsx React entry‑point (hydrate + BrowserRouter)
│ ├── index.css Tailwind directives + any global overrides
│ ├── tailwind.config.js Tailwind customization (colors, fonts, darkmode)
│ └── postcss.config.cjs PostCSS setup for Tailwind
├── .env.development Dev‑only env vars
├── .env.production Prod‑only env vars
├── vite.config.ts Vite configuration
├── tsconfig.json TypeScript settings
└── vite‑env.d.ts Vite type declarations

🛠️ Scripts
npm run dev / yarn dev
Start the development server with HMR.

npm run build / yarn build
Bundle for production (output in dist/).

npm run preview / yarn preview
Serve the production build locally.

🔧 Configuration
Tailwind CSS
Config in tailwind.config.js—customize colors, fonts, dark mode, etc.

Tailwind layers in src/index.css via @tailwind base, @tailwind components, @tailwind utilities.

Environment Variables
VITE_API_URL
Base URL for the backend API. Required in .env.development and .env.production.

🤝 Contributing
Fork the repo

Create a branch:
git checkout -b feature/your‑feature

Commit your changes with clear messages

Push & open a Pull Request

📄 License
This project is MIT Licensed.
