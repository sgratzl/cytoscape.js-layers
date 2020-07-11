import { ABaseLayer, ILayerAdapter } from './ABaseLayer';
import { IHTMLLayer, ILayerElement, ILayerImpl } from './interfaces';
import { layerStyle } from './utils';

export class HTMLLayer extends ABaseLayer implements IHTMLLayer, ILayerImpl {
  readonly type = 'html';
  readonly node: HTMLDivElement & ILayerElement;

  constructor(adapter: ILayerAdapter, doc: Document) {
    super(adapter);
    this.node = (doc.createElement('div') as unknown) as HTMLDivElement & ILayerElement;
    this.node.__cy_layer = this;
    Object.assign(this.node.style, layerStyle);
    this.node.style.overflow = 'hidden';
  }

  get root() {
    return this.node;
  }

  resize() {
    // dummy
  }

  setViewport(tx: number, ty: number, zoom: number) {
    this.node.style.transform = `translate(${tx}px,${ty}px)scale(${zoom})`;
  }

  remove() {
    this.node.remove();
  }
}
