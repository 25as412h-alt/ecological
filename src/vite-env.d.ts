/// <reference types="vite/client" />

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module 'leaflet/dist/leaflet.css'

declare module 'leaflet/dist/images/marker-icon.png' {
  const src: string
  export default src
}

declare module 'leaflet/dist/images/marker-icon-2x.png' {
  const src: string
  export default src
}

declare module 'leaflet/dist/images/marker-shadow.png' {
  const src: string
  export default src
}
