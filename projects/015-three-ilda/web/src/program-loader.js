import { ILDALoader, ILDA_DEFAULT_PALETTE } from '../vendor/three-ilda/src/loaders/ILDALoader.js';

// 与固定版本上游 examples/main.js 的 configureLoader 保持一致。
export function parseProgram(buffer, entry = {}) {
  const loader = new ILDALoader();
  if (entry.palette === 'observable-demo') {
    loader.setFallbackPalette(ILDA_DEFAULT_PALETTE.map((rgb, i) => i < 10 ? [55, rgb[1], rgb[2]] : rgb));
  }
  return loader.parse(buffer);
}
