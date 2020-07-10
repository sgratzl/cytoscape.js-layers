import cy from 'cytoscape';
import {
  CanvasLayerContainer,
  HTMLLayerContainer,
  IContainerLayer,
  ICytoscapeDragLayer,
  ICytoscapeNodeLayer,
  ICytoscapeSelectBoxLayer,
  ILayer,
  ILayerContainer,
  ILayerFunction,
  IRelativeLayerFunction,
  SVGLayerContainer,
} from './layers';

export default class LayersPlugin {
  readonly cy: cy.Core;
  private readonly containers: ILayerContainer[] = [];
  private readonly layers: IContainerLayer[] = [];

  readonly nodeLayer: ICytoscapeNodeLayer;
  readonly dragLayer: ICytoscapeDragLayer;
  readonly selectBoxLayer: ICytoscapeSelectBoxLayer;

  constructor(cy: cy.Core) {
    this.cy = cy;

    const container = cy.container()!;

    this.nodeLayer = this.initLayer({
      node: container.querySelector<HTMLCanvasElement>('[data-id="layer0-node"]')!,
      type: 'node',
      container: null,
    }) as ICytoscapeNodeLayer;
    this.dragLayer = this.initLayer({
      node: container.querySelector<HTMLCanvasElement>('[data-id="layer1-drag"]')!,
      type: 'drag',
      container: null,
    }) as ICytoscapeDragLayer;
    this.selectBoxLayer = this.initLayer({
      node: container.querySelector<HTMLCanvasElement>('[data-id="layer0-node"]')!,
      type: 'select-box',
      container: null,
    }) as ICytoscapeSelectBoxLayer;

    cy.on('viewport', this.zoomed);
    cy.on('resize', this.resize);
    cy.on('destroy', this.destroy);
  }

  get document() {
    return this.cy.container()!.ownerDocument;
  }

  get root() {
    return this.cy.container()!.querySelector('[data-id]')!.parentElement as HTMLElement;
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
      if (container instanceof CanvasLayerContainer) {
        container.draw();
      }
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
    _layer: ILayer,
    type: 'svg' | 'canvas' | 'html',
    render?: (ctx: CanvasRenderingContext2D) => void
  ): any => {
    // TODO
    switch (type) {
      case 'svg':
        return this.appendSVG();
      case 'canvas':
        return this.appendCanvas(render!);
      case 'html':
        return this.appendHTML();
    }
  };

  readonly insertAfter: IRelativeLayerFunction = (
    _layer: ILayer,
    type: 'svg' | 'canvas' | 'html',
    render?: (ctx: CanvasRenderingContext2D) => void
  ): any => {
    // TODO
    switch (type) {
      case 'svg':
        return this.appendSVG();
      case 'canvas':
        return this.appendCanvas(render!);
      case 'html':
        return this.appendHTML();
    }
  };

  getLast() {
    if (this.layers.length === 0) {
      return null;
    }
    return this.layers[this.layers.length - 1];
  }

  getFirst() {
    if (this.layers.length === 0) {
      return null;
    }
    return this.layers[0];
  }

  private removeLayer(layer: IContainerLayer) {
    const index = this.layers.indexOf(layer);
    if (index < 0) {
      return false;
    }
    this.layers.splice(index, 1);
    const container = layer.container;
    if (!container) {
      return true;
    }
    if (container.length > 1) {
      switch (layer.type) {
        case 'svg':
        case 'html':
          layer.node.remove();
          break;
        case 'canvas':
          ((container as unknown) as CanvasLayerContainer).removeLayer(layer.draw);
          break;
      }
      return;
    }

    container.remove();
    const containerIndex = this.containers.indexOf(container);
    this.containers.splice(containerIndex, 1);
    this.mergeContainers(containerIndex);
    return true;
  }

  private mergeContainers(nextIndex: number) {
    // merge test
    if (nextIndex === 0 || nextIndex === this.containers.length || this.containers.length === 1) {
      return;
    }
    const previous = this.containers[nextIndex - 1];
    const next = this.containers[nextIndex];

    if (previous instanceof CanvasLayerContainer && next instanceof CanvasLayerContainer) {
      for (const l of next.layers) {
        previous.pushLayer(l.render, l.draw);
      }
    } else if (
      (previous instanceof HTMLLayerContainer && next instanceof HTMLLayerContainer) ||
      (previous instanceof SVGLayerContainer && next instanceof SVGLayerContainer)
    ) {
      for (const l of Array.from(next.root.children)) {
        previous.root.appendChild(l);
      }
    } else {
      return;
    }
    this.containers.splice(nextIndex, 1);
    return;
  }

  private splitContainers(index: number, layerIndex: number) {
    const container = this.containers[index];

    if (container instanceof CanvasLayerContainer) {
      const previous = new CanvasLayerContainer(this.document);
      previous.layers.push(...container.layers.splice(0, layerIndex));
      this.containers.splice(index, 0, previous);
    } else if (container instanceof HTMLLayerContainer || container instanceof SVGLayerContainer) {
      const previous = new HTMLLayerContainer(this.document);
      for (const child of Array.from(container.root.children).slice(0, layerIndex).reverse()) {
        previous.root.appendChild(child);
      }
      this.containers.splice(index, 0, previous);
    }
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
    const r: any = {
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
      insertBefore(type: 'svg' | 'canvas' | 'html', render?: (ctx: CanvasRenderingContext2D) => void) {
        return that.insertBefore(this, type as any, render!) as any;
      },
      insertAfter(type: 'svg' | 'canvas' | 'html', render?: (ctx: CanvasRenderingContext2D) => void) {
        return that.insertAfter(this, type as any, render!);
      },
      remove() {
        return that.removeLayer(this);
      },
      ...l,
    };
    return r;
  }

  private appendSVG() {
    const last = this.getLast();
    let container: SVGLayerContainer | null = null;
    if (last && last.container instanceof SVGLayerContainer) {
      container = last.container;
    } else {
      // need a new container
      container = new SVGLayerContainer(this.cy.container()!.ownerDocument);
      this.initContainer(container);
    }
    const node = container.createLayer();
    container.root.appendChild(node);
    const layer = this.initLayer({
      type: 'svg',
      node,
      container,
    });
    this.layers.push(layer);
    return layer;
  }

  private appendHTML() {
    const last = this.getLast();
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
    const last = this.getLast();
    let container: CanvasLayerContainer | null = null;
    if (last && last.container instanceof CanvasLayerContainer) {
      container = last.container;
    } else {
      // need a new container
      container = new CanvasLayerContainer(this.cy.container()!.ownerDocument);
      this.initContainer(container);
    }
    const draw = container.pushLayer(render);
    const layer = this.initLayer({
      type: 'canvas',
      draw,
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
