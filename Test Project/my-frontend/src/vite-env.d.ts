/// <reference types="vite/client" />

// Now TS knows that `import.meta.env` exists and is typed:
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // add other VITE_… vars here as you use them
  // readonly VITE_OTHER_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
