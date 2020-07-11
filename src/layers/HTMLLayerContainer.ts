import { ILayerContainer, ILayer, IHTMLLayer } from './interfaces';
import { layerStyle } from './utils';

export class HTMLLayerContainer implements ILayerContainer {
  readonly node: HTMLDivElement;

  constructor(doc: Document) {
    this.node = doc.createElement('div');
    Object.assign(this.node.style, layerStyle);
    this.node.style.overflow = 'hidden';
  }

  get root() {
    return this.node;
  }

  get length() {
    return this.root.childElementCount;
  }

  indexOf(layer: ILayer) {
    if (layer.type !== 'html') {
      return -1;
    }
    return Array.from(this.root.children).indexOf(layer.node);
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

  createLayer() {
    return this.node.ownerDocument.createElement('div');
  }

  layer(where: 'before' | 'after', ref: ILayer | null) {
    const node = this.createLayer();
    if (ref) {
      (ref as IHTMLLayer).node.insertAdjacentElement(where === 'before' ? 'beforebegin' : 'afterend', node);
    } else {
      this.root.insertAdjacentElement(where === 'before' ? 'afterbegin' : 'beforeend', node);
    }
    return {
      type: 'html' as 'html',
      node,
      container: this,
    };
  }
}
