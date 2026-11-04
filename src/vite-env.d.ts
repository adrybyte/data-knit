/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GUMROAD_PRODUCT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
