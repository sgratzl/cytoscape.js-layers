import { bubbleSets } from './LayersPlugin';
export * from './LayersPlugin';
export { default as BubbleSetsPlugin } from './LayersPlugin';
export * from './BubbleSetPath';
export { default as BubbleSetPath } from './BubbleSetPath';

export default function register(
  cytoscape: (type: 'core' | 'collection' | 'layout', name: string, extension: any) => void
) {
  cytoscape('core', 'bubbleSets', bubbleSets);
}

// auto register
if (typeof (window as any).cytoscape !== 'undefined') {
  register((window as any).cytoscape);
}

export declare namespace cytoscape {
  type Ext2 = (cytoscape: (type: 'core' | 'collection' | 'layout', name: string, extension: any) => void) => void;
  function use(module: Ext2): void;

  interface Core {
    bubbleSets: typeof bubbleSets;
  }
}
