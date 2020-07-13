import {
  ICanvasLayer,
  IHTMLLayer,
  IMoveAbleLayer,
  ISVGLayer,
  ILayer,
  IHTMLStaticLayer,
  ISVGStaticLayer,
  ICanvasStaticLayer,
} from './interfaces';
import cy from 'cytoscape';

export interface ILayerAdapter {
  cy: cy.Core;
  move(layer: IMoveAbleLayer, offset: number): void;
  insert(
    where: 'before' | 'after',
    layer: IMoveAbleLayer,
    type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static'
  ): ILayer;
  isVisible(p: { x: number; y: number } | cy.BoundingBox12): boolean;
}

export abstract class ABaseLayer implements IMoveAbleLayer {
  private updateOnRenderEnabled = false;

  constructor(private readonly adapter: ILayerAdapter) {}

  isVisible(p: { x: number; y: number } | cy.BoundingBox12) {
    return this.adapter.isVisible(p);
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
