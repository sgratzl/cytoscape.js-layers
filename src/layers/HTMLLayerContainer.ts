import { ILayerContainer } from './interfaces';
import { layerStyle } from './utils';

export class HTMLLayerContainer implements ILayerContainer {
  readonly node: HTMLDivElement;

  constructor(doc: Document) {
    this.node = doc.createElement('div');
    Object.assign(this.node.style, layerStyle);
    this.node.style.overflow = 'hidden';
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

  update() {
    // dummy
  }

  createLayer() {
    return this.node.ownerDocument.createElement('div');
  }
}
