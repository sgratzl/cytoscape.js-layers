import { layers } from './LayersPlugin';
export * from './LayersPlugin';
export { default as LayersPlugin } from './LayersPlugin';
export * from './elements';
export * from './layers/public';

export default function register(
  cytoscape: (type: 'core' | 'collection' | 'layout', name: string, extension: any) => void
) {
  cytoscape('core', 'layers', layers);
}

// auto register
if (typeof (window as any).cytoscape !== 'undefined') {
  register((window as any).cytoscape);
}

export declare namespace cytoscape {
  type Ext2 = (cytoscape: (type: 'core' | 'collection' | 'layout', name: string, extension: any) => void) => void;
  function use(module: Ext2): void;

  interface Core {
    layers: typeof layers;
  }
}
