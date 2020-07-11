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
  ISVGLayer,
  ICanvasLayer,
  IHTMLLayer,
  SVGLayerContainer,
  CytoscapeContainer,
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

    const nodeLayerNode = container.querySelector<HTMLCanvasElement>('[data-id="layer2-node"]')!;
    this.nodeLayer = this.initLayer({
      node: nodeLayerNode,
      type: 'node',
      container: new CytoscapeContainer(nodeLayerNode, 'node'),
    }) as ICytoscapeNodeLayer;
    this.containers.push((this.nodeLayer as IContainerLayer).container!);
    this.layers.push(this.nodeLayer);

    const dragLayerNode = container.querySelector<HTMLCanvasElement>('[data-id="layer1-drag"]')!;
    this.dragLayer = this.initLayer({
      node: dragLayerNode,
      type: 'drag',
      container: new CytoscapeContainer(dragLayerNode, 'drag'),
    }) as ICytoscapeDragLayer;
    this.containers.push((this.dragLayer as IContainerLayer).container!);
    this.layers.push(this.dragLayer);

    const selectBoxNode = container.querySelector<HTMLCanvasElement>('[data-id="layer0-selectbox"]')!;
    this.selectBoxLayer = this.initLayer({
      node: selectBoxNode,
      type: 'select-box',
      container: new CytoscapeContainer(selectBoxNode, 'select-box'),
    }) as ICytoscapeSelectBoxLayer;
    this.containers.push((this.selectBoxLayer as IContainerLayer).container!);
    this.layers.push(this.selectBoxLayer);

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
  }

  update() {
    this.zoomed();
    for (const container of this.containers) {
      if (container instanceof CanvasLayerContainer) {
        container.draw();
      }
    }
  }

  append(type: 'svg'): ISVGLayer;
  append(type: 'canvas', render: (ctx: CanvasRenderingContext2D) => void): ICanvasLayer;
  append(type: 'html'): IHTMLLayer;
  append(type: 'svg' | 'canvas' | 'html', render?: (ctx: CanvasRenderingContext2D) => void): ILayer;
  append(type: 'svg' | 'canvas' | 'html', render?: (ctx: CanvasRenderingContext2D) => void) {
    switch (type) {
      case 'svg':
        const svgLayer = this.initLayer(this.ddContainer(type, this.getLast()).layer('after', null));
        this.layers.push(svgLayer);
        return svgLayer;
      case 'canvas':
        const canvasLayer = this.initLayer(this.ddContainer(type, this.getLast()).layer('after', null, render!));
        this.layers.push(canvasLayer);
        return canvasLayer;
      default:
        const htmlLayer = this.initLayer(this.ddContainer(type, this.getLast()).layer('after', null));
        this.layers.push(htmlLayer);
        return htmlLayer;
    }
  }

  insertBefore(layer: ILayer, type: 'svg'): ISVGLayer;
  insertBefore(layer: ILayer, type: 'canvas', render: (ctx: CanvasRenderingContext2D) => void): ICanvasLayer;
  insertBefore(layer: ILayer, type: 'html'): IHTMLLayer;
  insertBefore(layer: ILayer, type: 'svg' | 'canvas' | 'html', render?: (ctx: CanvasRenderingContext2D) => void) {
    const index = this.layers.indexOf(layer);
    if (index < 0) {
      return this.append(type, render);
    }
    const container = (layer as IContainerLayer).container;
    if (!container) {
      const prev = this.layers[index - 1];
    }
    if (container) {
      const containerIndex = container.indexOf(layer);
      if (layer.type === type) {
        // merge into the same container
        switch (type) {
          case 'canvas':
            const lc = this.initLayer((container as CanvasLayerContainer).layer('before', layer, render!));
            this.layers.splice(index, 0, lc);
            return lc;
          default:
            const l = this.initLayer((container as SVGLayerContainer | HTMLLayerContainer).layer('before', layer));
            this.layers.splice(index, 0, l);
            return l;
        }
      } else if (containerIndex === 0) {
        if (index === 0) {
        }
        // maybe merge into the previous one
      } else {
        // need to split
      }
    }

    if (!container) {
      const before = this.layers[index - 1];
      if (!before || before.type !== type) {
        // new container
      }
    }
    if (layer.type === type) {
    }

    switch (type) {
      case 'svg':
        return this.appendSVG();
      case 'canvas':
        return this.appendCanvas(render!);
      default:
        return this.appendHTML();
    }
  }

  insertAfter(layer: ILayer, type: 'svg'): ISVGLayer;
  insertAfter(layer: ILayer, type: 'canvas', render: (ctx: CanvasRenderingContext2D) => void): ICanvasLayer;
  insertAfter(layer: ILayer, type: 'html'): IHTMLLayer;
  insertAfter(layer: ILayer, type: 'svg' | 'canvas' | 'html', render?: (ctx: CanvasRenderingContext2D) => void) {
    // TODO
    switch (type) {
      case 'svg':
        return this.appendSVG();
      case 'canvas':
        return this.appendCanvas(render!);
      default:
        return this.appendHTML();
    }
  }

  getLast() {
    if (this.layers.length === 0) {
      return null;
    }
    return this.layers[this.layers.length - 1]!;
  }

  getFirst() {
    if (this.layers.length === 0) {
      return null;
    }
    return this.layers[0]!;
  }

  private removeLayer(layer: IContainerLayer) {
    const index = this.layers.indexOf(layer);
    if (index < 0) {
      return false;
    }
    this.layers.splice(index, 1);
    const container = layer.container!;
    if (container instanceof CytoscapeContainer) {
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

  private ddContainer(type: 'svg', ref?: IContainerLayer | null): SVGLayerContainer;
  private ddContainer(type: 'html', ref?: IContainerLayer | null): HTMLLayerContainer;
  private ddContainer(type: 'canvas', ref?: IContainerLayer | null): CanvasLayerContainer;
  private ddContainer(type: 'svg' | 'html' | 'canvas', ref?: IContainerLayer | null) {
    const containerClass =
      type === 'svg' ? SVGLayerContainer : type === 'html' ? HTMLLayerContainer : CanvasLayerContainer;
    if (ref != null && ref.container instanceof containerClass) {
      return ref.container;
    }
    const container = new containerClass(this.cy.container()!.ownerDocument);
    this.initContainer(container);
    if (ref) {
      if (ref.container) {
        const containerIndex = this.containers.indexOf(ref.container);
        ref.container.node.insertAdjacentElement('afterend', container.node);
        this.containers.splice(containerIndex + 1, 0, container);
      } else {
        const refNode = (ref as ICytoscapeDragLayer | ICytoscapeNodeLayer | ICytoscapeSelectBoxLayer).node;
      }
    } else {
      this.containers.push(container);
      this.root.appendChild(container.node);
    }
    return container;
  }
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
