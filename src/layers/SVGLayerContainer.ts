import { ILayerContainer, ILayer } from './interfaces';
import { layerStyle } from './utils';

export class SVGLayerContainer implements ILayerContainer {
  static readonly NS = 'http://www.w3.org/2000/svg';
  readonly node: SVGSVGElement;

  constructor(doc: Document) {
    this.node = doc.createElementNS(SVGLayerContainer.NS, 'svg');
    Object.assign(this.node.style, layerStyle);
    this.node.appendChild(doc.createElementNS(SVGLayerContainer.NS, 'g'));
  }

  get root() {
    return this.node.firstElementChild! as SVGGElement;
  }

  get length() {
    return this.root.childElementCount;
  }

  indexOf(layer: ILayer) {
    if (layer.type !== 'svg') {
      return -1;
    }
    return Array.from(this.root.children).indexOf(layer.node);
  }

  resize() {
    // dummy
  }

  setViewport(tx: number, ty: number, zoom: number) {
    this.root.setAttribute('transform', `translate(${tx},${ty})scale(${zoom})`);
  }

  remove() {
    this.node.remove();
  }

  createLayer() {
    return this.root.ownerDocument.createElementNS(SVGLayerContainer.NS, 'g');
  }
}
