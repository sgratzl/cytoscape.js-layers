import type {
  ICanvasLayer,
  IHTMLLayer,
  IMoveAbleLayer,
  ISVGLayer,
  ILayer,
  IHTMLStaticLayer,
  ISVGStaticLayer,
  ICanvasStaticLayer,
  IRenderHint,
} from './interfaces';
import type cy from 'cytoscape';
import type { ICanvasLayerOptions, ISVGLayerOptions, IHTMLLayerOptions } from './public';

export interface ILayerAdapter {
  cy: cy.Core;
  move(layer: IMoveAbleLayer, offset: number): void;
  insert(
    where: 'before' | 'after',
    layer: IMoveAbleLayer,
    type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static',
    options?: IHTMLLayerOptions | ICanvasLayerOptions | ISVGLayerOptions
  ): ILayer;
  inVisibleBounds(p: { x: number; y: number } | cy.BoundingBox12): boolean;
}

export abstract class ABaseLayer implements IMoveAbleLayer {
  private updateOnRenderEnabled = false;

  private updateOnRenderOnceEnabled = false;

  constructor(private readonly adapter: ILayerAdapter) {}

  inVisibleBounds(p: { x: number; y: number } | cy.BoundingBox12) {
    return this.adapter.inVisibleBounds(p);
  }

  supportsRender() {
    return false;
  }

  renderInto(_ctx: CanvasRenderingContext2D, _hint: IRenderHint): void {
    // dummy
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
      this.cy.off('render', this.update);
    }
  }

  updateOnRenderOnce = () => {
    if (this.updateOnRenderOnceEnabled) {
      return;
    }
    this.updateOnRenderOnceEnabled = true;
    this.cy.one('render', () => {
      this.updateOnRenderOnceEnabled = false;
      this.update();
    });
  };

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

  insertBefore(type: 'svg', options?: ISVGLayerOptions): ISVGLayer;
  insertBefore(type: 'svg-static', options?: ISVGLayerOptions): ISVGStaticLayer;
  insertBefore(type: 'canvas', options?: ICanvasLayerOptions): ICanvasLayer;
  insertBefore(type: 'canvas-static', options?: ICanvasLayerOptions): ICanvasStaticLayer;
  insertBefore(type: 'html', options?: IHTMLLayerOptions): IHTMLLayer;
  insertBefore(type: 'html-static', options?: IHTMLLayerOptions): IHTMLStaticLayer;
  insertBefore(
    type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static',
    options?: IHTMLLayerOptions | ISVGLayerOptions | ICanvasLayerOptions
  ) {
    return this.adapter.insert('before', this, type, options);
  }

  insertAfter(type: 'svg', options?: ISVGLayerOptions): ISVGLayer;
  insertAfter(type: 'svg-static', options?: ISVGLayerOptions): ISVGStaticLayer;
  insertAfter(type: 'canvas', options?: ICanvasLayerOptions): ICanvasLayer;
  insertAfter(type: 'canvas-static', options?: ICanvasLayerOptions): ICanvasStaticLayer;
  insertAfter(type: 'html', options?: IHTMLLayerOptions): IHTMLLayer;
  insertAfter(type: 'html-static', options?: IHTMLLayerOptions): IHTMLStaticLayer;
  insertAfter(
    type: 'svg' | 'html' | 'canvas' | 'svg-static' | 'html-static' | 'canvas-static',
    options?: IHTMLLayerOptions | ISVGLayerOptions | ICanvasLayerOptions
  ) {
    return this.adapter.insert('after', this, type, options);
  }
}
