import { ABaseLayer, ILayerAdapter } from './ABaseLayer';
import {
  ICytoscapeDragLayer,
  ICytoscapeNodeLayer,
  ICytoscapeSelectBoxLayer,
  ILayerElement,
  ILayerImpl,
} from './interfaces';

export class CytoscapeBaseLayer extends ABaseLayer implements ILayerImpl {
  readonly node: HTMLCanvasElement & ILayerElement;

  constructor(adapter: ILayerAdapter, node: HTMLCanvasElement) {
    super(adapter);
    this.node = (node as unknown) as HTMLCanvasElement & ILayerElement;
  }

  get root() {
    return this.node;
  }

  readonly update = () => {};

  resize() {}

  setViewport() {}

  remove() {}
}

export class CytoscapeNodeLayer extends CytoscapeBaseLayer implements ICytoscapeNodeLayer {
  readonly type = 'node';

  constructor(adapter: ILayerAdapter, node: HTMLCanvasElement) {
    super(adapter, node);
    this.node.__cy_layer = this;
  }
}

export class CytoscapeDragLayer extends CytoscapeBaseLayer implements ICytoscapeDragLayer {
  readonly type = 'drag';

  constructor(adapter: ILayerAdapter, node: HTMLCanvasElement) {
    super(adapter, node);
    this.node.__cy_layer = this;
  }
}

export class CytoscapeSelectBoxLayer extends CytoscapeBaseLayer implements ICytoscapeSelectBoxLayer {
  readonly type = 'select-box';

  constructor(adapter: ILayerAdapter, node: HTMLCanvasElement) {
    super(adapter, node);
    this.node.__cy_layer = this;
  }
}
