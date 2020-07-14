import cy from 'cytoscape';
import {
  HTMLLayer,
  ICytoscapeDragLayer,
  ICytoscapeNodeLayer,
  ICytoscapeSelectBoxLayer,
  ILayer,
  ISVGLayer,
  ICanvasLayer,
  IHTMLLayer,
  CytoscapeNodeLayer,
  CytoscapeDragLayer,
  CytoscapeSelectBoxLayer,
  ILayerImpl,
  ILayerElement,
  CanvasLayer,
  SVGLayer,
  IMoveAbleLayer,
  SVGStaticLayer,
  HTMLStaticLayer,
  ISVGStaticLayer,
  IHTMLStaticLayer,
  CanvasStaticLayer,
  ICanvasStaticLayer,
  IHTMLLayerOptions,
  ISVGLayerOptions,
  ICanvasLayerOptions,
  IPoint,
} from './layers';
import { ILayerAdapter } from './layers/ABaseLayer';
import { renderPerEdge, renderPerNode } from './elements';

function isPoint(p: IPoint | cy.BoundingBox12): p is IPoint {
  return (p as IPoint).x != null;
}

export default class LayersPlugin {
  readonly cy: cy.Core;

  readonly nodeLayer: ICytoscapeNodeLayer;
  readonly dragLayer: ICytoscapeDragLayer;
  readonly selectBoxLayer: ICytoscapeSelectBoxLayer;

  private readonly adapter: ILayerAdapter;

  private readonly viewport: { width: number; height: number; tx: number; ty: number; zoom: number };

  constructor(cy: cy.Core) {
    this.cy = cy;
    this.adapter = {
      cy: this.cy,
      insert: (where: 'before' | 'after', layer: IMoveAbleLayer, type) =>
        this.insert(where, layer as ILayer & ILayerImpl, type),
      move: (layer: IMoveAbleLayer, offset) => this.move(layer as ILayer & ILayerImpl, offset),
      inVisibleBounds: (p: IPoint | cy.BoundingBox12) => {
        const v = this.viewport;
        const inX = (x: number) => {
          const xp = x * v.zoom + v.tx;
          return xp >= 0 && xp <= v.width;
        };
        const inY = (y: number) => {
          const yp = y * v.zoom + v.ty;
          return yp >= 0 && yp <= v.height;
        };
        if (isPoint(p)) {
          return inX(p.x) && inY(p.y);
        }
        // any of the four corners or the center are inside
        return (
          (inX(p.x1) && inY(p.y1)) ||
          (inX(p.x2) && inY(p.y1)) ||
          (inX(p.x2) && inY(p.y2)) ||
          (inX(p.x1) && inY(p.y2)) ||
          (inX((p.x1 + p.x2) / 2) && inY((p.y1 + p.y2) / 2))
        );
      },
    };

    const container = cy.container()!;

    const nodeLayer = new CytoscapeNodeLayer(
      this.adapter,
      container.querySelector<HTMLCanvasElement>('[data-id="layer2-node"]')!
    );
    this.nodeLayer = nodeLayer;

    const dragLayer = new CytoscapeDragLayer(
      this.adapter,
      container.querySelector<HTMLCanvasElement>('[data-id="layer1-drag"]')!
    );
    this.dragLayer = dragLayer;

    const selectBoxLayer = new CytoscapeSelectBoxLayer(
      this.adapter,
      container.querySelector<HTMLCanvasElement>('[data-id="layer0-selectbox"]')!
    );
    this.selectBoxLayer = selectBoxLayer;

    nodeLayer.root.style.zIndex = '';
    dragLayer.root.style.zIndex = '';
    selectBoxLayer.root.style.zIndex = '';
    nodeLayer.root.insertAdjacentElement('afterend', dragLayer.root);
    dragLayer.root.insertAdjacentElement('afterend', selectBoxLayer.root);

    cy.on('viewport', this.zoomed);
    cy.on('resize', this.resize);
    cy.on('destroy', this.destroy);

    this.viewport = {
      width: this.cy.width(),
      height: this.cy.height(),
      tx: this.cy.pan().x,
      ty: this.cy.pan().y,
      zoom: this.cy.zoom(),
    };
  }

  private move(layer: ILayer & ILayerImpl, offset: number) {
    const l = this.layers;
    const index = l.indexOf(layer);
    const target = Math.max(Math.min(index + offset, l.length, 0));
    if (target === index) {
      return;
    }
    if (index >= l.length - 1) {
      this.root.appendChild(layer.root);
    } else {
      this.root.insertBefore(layer.root, l[target].root);
    }
  }

  get document() {
    return this.cy.container()!.ownerDocument;
  }

  get root() {
    return this.nodeLayer.node.parentElement! as HTMLElement;
  }

  private get layers(): readonly (ILayer & ILayerImpl)[] {
    return Array.from(this.root.children)
      .map((d) => ((d as unknown) as ILayerElement).__cy_layer)
      .filter((d) => d != null);
  }

  getLayers(): readonly ILayer[] {
    return this.layers;
  }

  private readonly resize = () => {
    const width = this.cy.width();
    const height = this.cy.height();
    this.viewport.width = width;
    this.viewport.height = height;

    for (const layer of this.layers) {
      layer.resize(width, height);
    }
  };

  private readonly destroy = () => {
    for (const layer of this.layers) {
      layer.remove();
    }

    this.cy.off('destroy', undefined, this.destroy);
    this.cy.off('viewport', undefined, this.zoomed);
    this.cy.off('resize', undefined, this.resize);
    this.cy.scratch('_layers', undefined);
  };

  private readonly zoomed = () => {
    const pan = this.cy.pan();
    const zoom = this.cy.zoom();
    this.viewport.tx = pan.x;
    this.viewport.ty = pan.y;
    this.viewport.zoom = zoom;

    for (const layer of this.layers) {
      layer.setViewport(pan.x, pan.y, zoom);
    }
  };

  private init<T extends ILayer & ILayerImpl>(layer: T): T {
    layer.resize(this.viewport.width, this.viewport.height);
    layer.setViewport(this.viewport.tx, this.viewport.ty, this.viewport.zoom);
    return layer;
  }

  update() {
    this.zoomed();
    for (const layer of this.layers) {
      if (layer instanceof CanvasLayer) {
        layer.draw();
      }
    }
  }

  private createLayer(
    type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static',
    options?: IHTMLLayerOptions | ISVGLayerOptions | ICanvasLayerOptions
  ) {
    switch (type) {
      case 'svg':
        return this.init(new SVGLayer(this.adapter, this.document, options));
      case 'html':
        return this.init(new HTMLLayer(this.adapter, this.document, options));
      case 'canvas':
        return this.init(new CanvasLayer(this.adapter, this.document, options));
      case 'html-static':
        return this.init(new HTMLStaticLayer(this.adapter, this.document, options));
      case 'svg-static':
        return this.init(new SVGStaticLayer(this.adapter, this.document, options));
      case 'canvas-static':
        return this.init(new CanvasStaticLayer(this.adapter, this.document, options));
    }
  }

  append(type: 'svg', options?: ISVGLayerOptions): ISVGLayer;
  append(type: 'svg-static', options?: ISVGLayerOptions): ISVGStaticLayer;
  append(type: 'canvas', options?: ICanvasLayerOptions): ICanvasLayer;
  append(type: 'canvas-static', options?: ICanvasLayerOptions): ICanvasStaticLayer;
  append(type: 'html', options?: IHTMLLayerOptions): IHTMLLayer;
  append(type: 'html-static', options?: IHTMLLayerOptions): IHTMLStaticLayer;
  append(
    type: 'svg' | 'html' | 'canvas' | 'canvas-static' | 'svg-static' | 'html-static',
    options?: IHTMLLayerOptions | ISVGLayerOptions | ICanvasLayerOptions
  ) {
    const layer = this.createLayer(type, options);
    this.root.appendChild(layer.root);
    return layer as any;
  }

  insert(where: 'before' | 'after', layer: ILayer & ILayerImpl, type: 'svg', options?: ISVGLayerOptions): ISVGLayer;
  insert(
    where: 'before' | 'after',
    layer: ILayer & ILayerImpl,
    type: 'svg-static',
    options?: ISVGLayerOptions
  ): ISVGStaticLayer;
  insert(
    where: 'before' | 'after',
    layer: ILayer & ILayerImpl,
    type: 'canvas',
    options?: ICanvasLayerOptions
  ): ICanvasLayer;
  insert(
    where: 'before' | 'after',
    layer: ILayer & ILayerImpl,
    type: 'canvas-static',
    options?: ICanvasLayerOptions
  ): ICanvasStaticLayer;
  insert(where: 'before' | 'after', layer: ILayer & ILayerImpl, type: 'html', options?: IHTMLLayerOptions): IHTMLLayer;
  insert(
    where: 'before' | 'after',
    layer: ILayer & ILayerImpl,
    type: 'html-static',
    options?: IHTMLLayerOptions
  ): IHTMLStaticLayer;
  insert(
    where: 'before' | 'after',
    layer: ILayer & ILayerImpl,
    type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static',
    options?: IHTMLLayerOptions | ISVGLayerOptions | ICanvasLayerOptions
  ): ISVGLayer | ICanvasLayer | IHTMLLayer;
  insert(
    where: 'before' | 'after',
    ref: ILayer & ILayerImpl,
    type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static',
    options?: IHTMLLayerOptions | ISVGLayerOptions | ICanvasLayerOptions
  ) {
    const layer = this.createLayer(type, options);
    ref.root.insertAdjacentElement(where === 'before' ? 'beforebegin' : 'afterend', layer.root);
    return layer as any;
  }

  getLast(): ILayer | null {
    const layers = this.layers;
    return layers[layers.length - 1] ?? null;
  }

  getFirst(): ILayer | null {
    const layers = this.layers;
    return layers[0] ?? null;
  }

  readonly renderPerEdge = renderPerEdge;
  readonly renderPerNode = renderPerNode;
}

export function layers(this: cy.Core): LayersPlugin;
export function layers(cy: cy.Core): LayersPlugin;
export function layers(this: cy.Core, cy: cy.Core = this) {
  if (!cy.container()) {
    throw new Error('layers plugin does not work in headless environments');
  }
  // ensure just one instance exists
  const singleton = cy.scratch('_layers') as LayersPlugin;
  if (singleton) {
    return singleton;
  }
  const plugin = new LayersPlugin(cy);
  cy.scratch('_layers', plugin);
  return plugin;
}
