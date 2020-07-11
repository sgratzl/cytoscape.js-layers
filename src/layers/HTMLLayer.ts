import { ABaseLayer, ILayerAdapter } from './ABaseLayer';
import { IHTMLLayer, ILayerElement, ILayerImpl, IHTMLStaticLayer } from './interfaces';
import { layerStyle } from './utils';

export class HTMLLayer extends ABaseLayer implements IHTMLLayer, ILayerImpl {
  readonly type = 'html';
  readonly node: HTMLDivElement & ILayerElement;
  readonly root: HTMLElement;

  constructor(adapter: ILayerAdapter, doc: Document) {
    super(adapter);
    this.root = doc.createElement('div');
    Object.assign(this.root.style, layerStyle);
    this.root.style.overflow = 'hidden';
    this.node = (doc.createElement('div') as unknown) as HTMLDivElement & ILayerElement;
    this.node.__cy_layer = this;
    this.root.appendChild(this.node);
  }

  resize() {
    // dummy
  }

  setViewport(tx: number, ty: number, zoom: number) {
    this.node.style.transform = `translate(${tx}px,${ty}px)scale(${zoom})`;
  }

  remove() {
    this.root.remove();
  }
}

export class HTMLStaticLayer extends ABaseLayer implements IHTMLStaticLayer, ILayerImpl {
  readonly type = 'html-static';
  readonly node: HTMLElement & ILayerElement;

  constructor(adapter: ILayerAdapter, doc: Document) {
    super(adapter);
    this.node = (doc.createElement('div') as unknown) as HTMLDivElement & ILayerElement;
    this.node.style.overflow = 'hidden';
    this.node.__cy_layer = this;
    Object.assign(this.node.style, layerStyle);
  }

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
