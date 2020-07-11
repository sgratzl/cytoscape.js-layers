import { ILayer, ILayerContainer } from './interfaces';

export class CytoscapeContainer implements ILayerContainer {
  readonly node: HTMLCanvasElement;

  constructor(node: HTMLCanvasElement, public readonly type: 'node' | 'drag' | 'select-box') {
    this.node = node;
  }

  get length() {
    return 1;
  }

  indexOf(layer: ILayer) {
    if (layer.type !== this.type) {
      return -1;
    }
    return 0;
  }

  resize() {}

  setViewport() {}

  remove() {}
}
