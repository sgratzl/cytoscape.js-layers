import { layers } from './LayersPlugin';
export * from './LayersPlugin';
export { default as LayersPlugin } from './LayersPlugin';
export * from './elements';
export * from './layers/public';

export default function register(
  cytoscape: (type: 'core' | 'collection' | 'layout', name: string, extension: unknown) => void
) {
  cytoscape('core', 'layers', layers);
}

// auto register
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (window as any).cytoscape !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register((window as any).cytoscape);
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace cytoscape {
  type Ext2 = (cytoscape: (type: 'core' | 'collection' | 'layout', name: string, extension: unknown) => void) => void;
  function use(module: Ext2): void;

  interface Core {
    layers: typeof layers;
  }
}
