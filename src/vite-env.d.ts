/// <reference types="vite/client" />

interface LemonSqueezyApi {
  Url: {
    Open: (url: string) => void
    Close: () => void
  }
}

interface Window {
  createLemonSqueezy?: () => void
  LemonSqueezy?: LemonSqueezyApi
}
