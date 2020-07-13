import { ABaseLayer, ILayerAdapter } from './ABaseLayer';
import { IHTMLLayer, ILayerElement, ILayerImpl, IHTMLStaticLayer, INodeUpdateFunction } from './interfaces';
import { layerStyle } from './utils';

export class HTMLLayer extends ABaseLayer implements IHTMLLayer, ILayerImpl {
  readonly type = 'html';
  readonly node: HTMLDivElement & ILayerElement;
  readonly root: HTMLElement & ILayerElement;
  readonly callbacks: INodeUpdateFunction[] = [];
  updateOnTransform = false;

  constructor(adapter: ILayerAdapter, doc: Document) {
    super(adapter);
    this.root = (doc.createElement('div') as unknown) as HTMLDivElement & ILayerElement;
    Object.assign(this.root.style, layerStyle);
    this.root.__cy_layer = this;
    this.root.style.overflow = 'hidden';
    this.node = (doc.createElement('div') as unknown) as HTMLDivElement & ILayerElement;
    this.node.__cy_layer = this;
    this.node.style.position = 'absolute';
    this.node.style.left = '0px';
    this.node.style.top = '0px';
    this.root.appendChild(this.node);
  }

  callback(callback: INodeUpdateFunction) {
    this.callbacks.push(callback);
    this.update();
    return this;
  }

  readonly update = () => {
    for (const o of this.callbacks) {
      o(this.node);
    }
  };

  resize() {
    // dummy
  }

  setViewport(tx: number, ty: number, zoom: number) {
    this.node.style.transform = `translate(${tx}px,${ty}px)scale(${zoom})`;
    if (this.updateOnTransform) {
      this.update();
    }
  }

  remove() {
    this.root.remove();
  }
}

export class HTMLStaticLayer extends ABaseLayer implements IHTMLStaticLayer, ILayerImpl {
  readonly type = 'html-static';
  readonly node: HTMLElement & ILayerElement;
  readonly callbacks: INodeUpdateFunction[] = [];

  constructor(adapter: ILayerAdapter, doc: Document) {
    super(adapter);
    this.node = (doc.createElement('div') as unknown) as HTMLDivElement & ILayerElement;
    this.node.style.overflow = 'hidden';
    this.node.__cy_layer = this;
    Object.assign(this.node.style, layerStyle);
  }

  callback(callback: INodeUpdateFunction) {
    this.callbacks.push(callback);
    this.update();
    return this;
  }

  readonly update = () => {
    for (const o of this.callbacks) {
      o(this.node);
    }
  };

  get root() {
    return this.node;
  }

  resize() {
    // dummy
  }

  setViewport() {
    // dummy
  }

  remove() {
    this.root.remove();
  }
}
