/// <reference types="vite/client" />

// Figma Make asset imports: `import x from 'figma:asset/<file>'` is rewritten
// by the figmaAssetResolver plugin in vite.config.ts to `src/assets/<file>`.
declare module 'figma:asset/*' {
  const src: string;
  export default src;
}
