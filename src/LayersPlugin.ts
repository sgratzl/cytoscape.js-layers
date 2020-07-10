import cy from 'cytoscape';
import { ILayerContainer } from './layers';

export interface ILayersPluginOptions {}

export const NODE_LAYER = 10;
export const DRAG_LAYER = 20;
export const SELECT_BOX_LAYER = 30;

export default class LayersPlugin {
  readonly cy: cy.Core;
  private readonly containers: ILayerContainer[] = [];

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

  update() {
    this.zoomed();
    for (const container of this.containers) {
      container.update();
    }
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
