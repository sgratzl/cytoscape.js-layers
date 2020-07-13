import {
  ICanvasLayer,
  IHTMLLayer,
  IMoveAbleLayer,
  ISVGLayer,
  ILayer,
  IHTMLStaticLayer,
  ISVGStaticLayer,
  ICanvasStaticLayer,
  ILayerElement,
} from './interfaces';
import cy from 'cytoscape';
import { IDOMUpdateFunction } from './public';
import { layerStyle } from './utils';

export interface ILayerAdapter {
  cy: cy.Core;
  move(layer: IMoveAbleLayer, offset: number): void;
  insert(
    where: 'before' | 'after',
    layer: IMoveAbleLayer,
    type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static'
  ): ILayer;
  inVisibleBounds(p: { x: number; y: number } | cy.BoundingBox12): boolean;
}

export abstract class ABaseLayer implements IMoveAbleLayer {
  private updateOnRenderEnabled = false;

  constructor(private readonly adapter: ILayerAdapter) {}

  inVisibleBounds(p: { x: number; y: number } | cy.BoundingBox12) {
    return this.adapter.inVisibleBounds(p);
  }

  get updateOnRender() {
    return this.updateOnRenderEnabled;
  }

  set updateOnRender(value: boolean) {
    if (this.updateOnRenderEnabled === value) {
      return;
    }
    this.updateOnRenderEnabled = value;
    if (value) {
      this.cy.on('render', this.update);
    } else {
      this.cy.off('render', undefined, this.update);
    }
  }

  abstract readonly update: () => void;

  get cy() {
    return this.adapter.cy;
  }

  moveUp() {
    this.adapter.move(this, -1);
  }
  moveDown() {
    this.adapter.move(this, 1);
  }
  moveBack() {
    this.adapter.move(this, Number.NEGATIVE_INFINITY);
  }
  moveFront() {
    this.adapter.move(this, Number.POSITIVE_INFINITY);
  }

  insertBefore(type: 'svg'): ISVGLayer;
  insertBefore(type: 'svg-static'): ISVGStaticLayer;
  insertBefore(type: 'canvas'): ICanvasLayer;
  insertBefore(type: 'html'): IHTMLLayer;
  insertBefore(type: 'html-static'): IHTMLStaticLayer;
  insertBefore(type: 'canvas-static'): ICanvasStaticLayer;
  insertBefore(type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static') {
    return this.adapter.insert('before', this, type);
  }

  insertAfter(type: 'svg'): ISVGLayer;
  insertAfter(type: 'svg-static'): ISVGStaticLayer;
  insertAfter(type: 'canvas'): ICanvasLayer;
  insertAfter(type: 'html'): IHTMLLayer;
  insertAfter(type: 'html-static'): IHTMLStaticLayer;
  insertAfter(type: 'canvas-static'): ICanvasStaticLayer;
  insertAfter(type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static') {
    return this.adapter.insert('after', this, type);
  }
}

export abstract class ADOMBaseLayer<T extends HTMLElement | SVGElement> extends ABaseLayer {
  readonly root: T & ILayerElement;
  readonly callbacks: IDOMUpdateFunction<T>[] = [];

  constructor(adapter: ILayerAdapter, root: T) {
    super(adapter);
    this.root = (root as unknown) as T & ILayerElement;
    Object.assign(this.root.style, layerStyle);
  }

  abstract get node(): T;

  readonly update = () => {
    for (const o of this.callbacks) {
      o(this.node);
    }
  };

  get visible() {
    return this.root.style.display !== 'none';
  }

  set visible(value: boolean) {
    this.root.style.display = value ? '' : 'none';
  }

  show() {
    this.visible = true;
  }
  hide() {
    this.visible = false;
  }

  callback(callback: IDOMUpdateFunction<T>) {
    this.callbacks.push(callback);
    this.update();
    return this;
  }

  resize() {
    // dummy
  }

  remove() {
    this.root.remove();
  }
}
