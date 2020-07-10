import cy from 'cytoscape';
import {
  ILayerContainer,
  IMoveAbleLayer,
  ILayerFunction,
  ICustomLayer,
  ICytoscapeLayer,
  ILayer,
  SVGLayerContainer,
  ISVGLayer,
  IContainerLayer,
  CanvasLayerContainer,
  HTMLLayerContainer,
  IHTMLLayer,
  ICanvasLayer,
  IRelativeLayerFunction,
} from './layers';

export default class LayersPlugin {
  readonly cy: cy.Core;
  private readonly containers: ILayerContainer[] = [];
  private readonly layers: IContainerLayer[] = [];

  readonly nodeLayer: ICytoscapeLayer;
  readonly dragLayer: ICytoscapeLayer;
  readonly selectBoxLayer: ICytoscapeLayer;

  constructor(cy: cy.Core) {
    this.cy = cy;

    const container = cy.container()!;

    // change z-indices to have more space between
    for (const layer of Array.from(container.querySelectorAll<HTMLElement>('[data-id^=layer]'))) {
      layer.style.zIndex = `${layer.style.zIndex}0`;
    }

    cy.on('viewport', this.zoomed);
    cy.on('resize', this.resize);
    cy.on('destroy', this.destroy);
  }

  get document() {
    return this.cy.container()!.ownerDocument;
  }

  get root() {
    return this.cy.container()!.firstElementChild!;
  }

  getLayers(): readonly ILayer[] {
    return this.layers.slice();
  }

  private readonly resize = () => {
    const width = this.cy.width();
    const height = this.cy.height();

    for (const container of this.containers) {
      container.resize(width, height);
    }
  };

  private readonly destroy = () => {
    for (const container of this.containers) {
      container.remove();
    }
    this.layers.splice(0, this.layers.length);
    this.containers.splice(0, this.containers.length);

    this.cy.off('destroy', undefined, this.destroy);
    this.cy.off('viewport', undefined, this.zoomed);
    this.cy.off('resize', undefined, this.resize);
    this.cy.scratch('_layers', undefined);
  };

  private readonly zoomed = () => {
    const pan = this.cy.pan();
    const zoom = this.cy.zoom();
    for (const container of this.containers) {
      container.setViewport(pan.x, pan.y, zoom);
    }
  };

  private initContainer(container: ILayerContainer) {
    container.resize(this.cy.width(), this.cy.height());
    const pan = this.cy.pan();
    const zoom = this.cy.zoom();
    container.setViewport(pan.x, pan.y, zoom);
    this.containers.push(container);
    this.root.appendChild(container.node);
  }

  update() {
    this.zoomed();
    for (const container of this.containers) {
      container.update();
    }
  }

  readonly append: ILayerFunction = (
    type: 'svg' | 'canvas' | 'html',
    render?: (ctx: CanvasRenderingContext2D) => void
  ): any => {
    switch (type) {
      case 'svg':
        return this.appendSVG();
      case 'canvas':
        return this.appendCanvas(render!);
      case 'html':
        return this.appendHTML();
    }
  };

  readonly insertBefore: IRelativeLayerFunction = (
    layer: ILayer,
    type: 'svg' | 'canvas' | 'html',
    render?: (ctx: CanvasRenderingContext2D) => void
  ): any => {
    switch (type) {
      case 'svg':
        return this.appendSVG();
      case 'canvas':
        return this.appendCanvas(render!);
      case 'html':
        return this.appendHTML();
    }
  };

  getLastLayer() {
    if (this.layers.length === 0) {
      return null;
    }
    return this.layers[this.layers.length - 1];
  }

  getFirstLayer() {
    if (this.layers.length === 0) {
      return null;
    }
    return this.layers[0];
  }

  private removeLayer(layer: IContainerLayer) {
    const index = this.layers.indexOf(layer);
    if (index < 0) {
      return;
    }
    this.layers.splice(index, 1);
    const container = layer.container;
    if (!container) {
      return;
    }
    // TODO remove layer from container
    // and remove container if not needed anymore
    // and merge neighboring containers if possible
  }

  private move(layer: IContainerLayer, delta: number) {
    const index = this.layers.indexOf(layer);
    if (index < 0) {
      return layer;
    }
    let targetIndex = Math.max(0, Math.min(this.layers.length - 1, index + delta));
    if (index === targetIndex) {
      return layer;
    }
    return layer;
    // this.layers.splice(index, 1);
    // if (index < targetIndex) {
    //   targetIndex--;
    // }
    // TODO
    // const target = this.layers[targetIndex];
    // if (!layer.container && !target.container) {
    //   // move within single ones
    // }
    // if (!layer.container) {
    // } else {
    //   const containerIndex = layer.container.indexOf(layer);
    // }
  }

  private initLayer(l: Partial<IContainerLayer>): IContainerLayer {
    let that = this;
    return {
      moveUp() {
        return that.move(this, -1);
      },
      moveDown() {
        return that.move(this, 1);
      },
      moveBack() {
        return that.move(this, Number.NEGATIVE_INFINITY);
      },
      moveFront() {
        return that.move(this, Number.POSITIVE_INFINITY);
      },
      insertBefore(type, render) {
        return that.insertBefore(this, type, render);
      },
      insertAfter(type, render) {
        return that.insertAfter(this, type, render);
      },
      remove() {
        return that.removeLayer(this);
      },
      ...l,
    };
  }

  private appendSVG() {
    const last = this.getLastLayer();
    let container: SVGLayerContainer | null = null;
    if (last && last.container instanceof SVGLayerContainer) {
      container = last.container;
    } else {
      // need a new container
      container = new SVGLayerContainer(this.cy.container()!.ownerDocument);
      this.initContainer(container);
    }
    const node = container.createLayer();
    container.node.appendChild(node);
    const layer = this.initLayer({
      type: 'svg',
      node,
      container,
    });
    this.layers.push(layer);
    return layer;
  }

  private appendHTML() {
    const last = this.getLastLayer();
    let container: HTMLLayerContainer | null = null;
    if (last && last.container instanceof HTMLLayerContainer) {
      container = last.container;
    } else {
      // need a new container
      container = new HTMLLayerContainer(this.cy.container()!.ownerDocument);
      this.initContainer(container);
    }
    const node = container.createLayer();
    container.node.appendChild(node);
    const layer = this.initLayer({
      type: 'html',
      node,
      container,
    });
    this.layers.push(layer);
    return layer;
  }

  private appendCanvas(render: (ctx: CanvasRenderingContext2D) => void) {
    const last = this.getLastLayer();
    let container: CanvasLayerContainer | null = null;
    if (last && last.container instanceof CanvasLayerContainer) {
      container = last.container;
    } else {
      // need a new container
      container = new CanvasLayerContainer(this.cy.container()!.ownerDocument);
      this.initContainer(container);
    }
    container.pushLayer(render);
    const layer = this.initLayer({
      type: 'canvas',
      render,
      container,
    });
    this.layers.push(layer);
    return layer;
  }
}

export function layers(this: cy.Core) {
  if (!this.container()) {
    throw new Error('layers plugin does not work in headless environments');
  }
  // ensure just one instance exists
  const singleton = this.scratch('_layers') as LayersPlugin;
  if (singleton) {
    return singleton;
  }
  const plugin = new LayersPlugin(this);
  this.scratch('_layers', plugin);
  return plugin;
}
