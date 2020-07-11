import { ABaseLayer, ILayerAdapter } from './ABaseLayer';
import { ILayerElement, ISVGLayer, ILayerImpl } from './interfaces';
import { layerStyle } from './utils';

export class SVGLayer extends ABaseLayer implements ISVGLayer, ILayerImpl {
  readonly type = 'svg';
  static readonly NS = 'http://www.w3.org/2000/svg';
  readonly node: SVGGElement & ILayerElement;
  readonly root: SVGSVGElement;

  constructor(adapter: ILayerAdapter, doc: Document) {
    super(adapter);
    this.root = (doc.createElementNS(SVGLayer.NS, 'svg') as unknown) as SVGSVGElement & ILayerElement;
    Object.assign(this.root.style, layerStyle);
    this.node = (doc.createElementNS(SVGLayer.NS, 'svg') as unknown) as SVGGElement & ILayerElement;
    this.node.__cy_layer = this;
    this.root.appendChild(this.node);
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
}
