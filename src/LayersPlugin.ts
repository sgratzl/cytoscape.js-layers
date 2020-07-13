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
} from './layers';
import { ILayerAdapter } from './layers/ABaseLayer';
import { renderPerEdge, renderPerNode } from './elements';

export default class LayersPlugin {
  readonly cy: cy.Core;

  readonly nodeLayer: ICytoscapeNodeLayer;
  readonly dragLayer: ICytoscapeDragLayer;
  readonly selectBoxLayer: ICytoscapeSelectBoxLayer;

  private readonly adapter: ILayerAdapter;

  constructor(cy: cy.Core) {
    this.cy = cy;
    this.adapter = {
      cy: this.cy,
      insert: (where: 'before' | 'after', layer: IMoveAbleLayer, type) =>
        this.insert(where, layer as ILayer & ILayerImpl, type),
      move: (layer: IMoveAbleLayer, offset) => this.move(layer as ILayer & ILayerImpl, offset),
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
    for (const layer of this.layers) {
      layer.setViewport(pan.x, pan.y, zoom);
    }
  };

  private init<T extends ILayer & ILayerImpl>(layer: T): T {
    layer.resize(this.cy.width(), this.cy.height());
    const pan = this.cy.pan();
    const zoom = this.cy.zoom();
    layer.setViewport(pan.x, pan.y, zoom);
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

  private createLayer(type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static') {
    switch (type) {
      case 'svg':
        return this.init(new SVGLayer(this.adapter, this.document));
      case 'html':
        return this.init(new HTMLLayer(this.adapter, this.document));
      case 'canvas':
        return this.init(new CanvasLayer(this.adapter, this.document));
      case 'html-static':
        return this.init(new HTMLStaticLayer(this.adapter, this.document));
      case 'svg-static':
        return this.init(new SVGStaticLayer(this.adapter, this.document));
      case 'canvas-static':
        return this.init(new CanvasStaticLayer(this.adapter, this.document));
    }
  }

  append(type: 'svg'): ISVGLayer;
  append(type: 'svg-static'): ISVGStaticLayer;
  append(type: 'canvas'): ICanvasLayer;
  append(type: 'canvas-static'): ICanvasStaticLayer;
  append(type: 'html'): IHTMLLayer;
  append(type: 'html-static'): IHTMLStaticLayer;
  append(type: 'svg' | 'html' | 'canvas' | 'canvas-static' | 'svg-static' | 'html-static') {
    const layer = this.createLayer(type);
    this.root.appendChild(layer.root);
    return layer as any;
  }

  insert(where: 'before' | 'after', layer: ILayer & ILayerImpl, type: 'svg'): ISVGLayer;
  insert(where: 'before' | 'after', layer: ILayer & ILayerImpl, type: 'canvas'): ICanvasLayer;
  insert(where: 'before' | 'after', layer: ILayer & ILayerImpl, type: 'html'): IHTMLLayer;
  insert(where: 'before' | 'after', layer: ILayer & ILayerImpl, type: 'html-static'): IHTMLStaticLayer;
  insert(where: 'before' | 'after', layer: ILayer & ILayerImpl, type: 'svg-static'): ISVGStaticLayer;
  insert(where: 'before' | 'after', layer: ILayer & ILayerImpl, type: 'canvas-static'): ICanvasStaticLayer;
  insert(
    where: 'before' | 'after',
    layer: ILayer & ILayerImpl,
    type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static'
  ): ISVGLayer | ICanvasLayer | IHTMLLayer;
  insert(
    where: 'before' | 'after',
    ref: ILayer & ILayerImpl,
    type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static'
  ) {
    const layer = this.createLayer(type);
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
