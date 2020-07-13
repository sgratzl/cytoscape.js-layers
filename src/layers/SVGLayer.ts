import { ABaseLayer, ILayerAdapter } from './ABaseLayer';
import { ILayerElement, ISVGLayer, ILayerImpl, ISVGStaticLayer, ISVGNodeUpdateFunction } from './interfaces';
import { layerStyle } from './utils';

export const SVG_NS = 'http://www.w3.org/2000/svg';

export class SVGLayer extends ABaseLayer implements ISVGLayer, ILayerImpl {
  readonly type = 'svg';
  readonly node: SVGGElement & ILayerElement;
  readonly root: SVGSVGElement & ILayerElement;
  readonly callbacks: ISVGNodeUpdateFunction[] = [];
  updateOnTransform = false;

  constructor(adapter: ILayerAdapter, doc: Document) {
    super(adapter);
    this.root = (doc.createElementNS(SVG_NS, 'svg') as unknown) as SVGSVGElement & ILayerElement;
    Object.assign(this.root.style, layerStyle);
    this.root.__cy_layer = this;
    this.node = (doc.createElementNS(SVG_NS, 'g') as unknown) as SVGGElement & ILayerElement;
    this.node.__cy_layer = this;
    this.root.appendChild(this.node);
  }
  callback(callback: ISVGNodeUpdateFunction) {
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
    this.node.setAttribute('transform', `translate(${tx},${ty})scale(${zoom})`);
    if (this.updateOnTransform) {
      this.update();
    }
  }

  remove() {
    this.root.remove();
  }
}

export class SVGStaticLayer extends ABaseLayer implements ISVGStaticLayer, ILayerImpl {
  readonly type = 'svg-static';
  readonly node: SVGSVGElement & ILayerElement;
  readonly callbacks: ISVGNodeUpdateFunction[] = [];

  constructor(adapter: ILayerAdapter, doc: Document) {
    super(adapter);
    this.node = (doc.createElementNS(SVG_NS, 'svg') as unknown) as SVGSVGElement & ILayerElement;
    Object.assign(this.node.style, layerStyle);
    this.node.__cy_layer = this;
  }

  callback(callback: ISVGNodeUpdateFunction) {
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
