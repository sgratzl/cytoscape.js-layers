import {
  ICanvasLayer,
  IHTMLLayer,
  IMoveAbleLayer,
  ISVGLayer,
  ILayer,
  IRenderFunction,
  IHTMLStaticLayer,
  ISVGStaticLayer,
} from './interfaces';

export interface ILayerAdapter {
  move(layer: IMoveAbleLayer, offset: number): void;
  insert(
    where: 'before' | 'after',
    layer: IMoveAbleLayer,
    type: 'svg' | 'html' | IRenderFunction | 'svg-static' | 'html-static'
  ): ILayer;
}

export class ABaseLayer implements IMoveAbleLayer {
  constructor(private readonly adapter: ILayerAdapter) {}

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
  insertBefore(type: IRenderFunction): ICanvasLayer;
  insertBefore(type: 'html'): IHTMLLayer;
  insertBefore(type: 'html-static'): IHTMLStaticLayer;
  insertBefore(type: 'svg' | 'html' | IRenderFunction | 'svg-static' | 'html-static') {
    return this.adapter.insert('before', this, type);
  }

  insertAfter(type: 'svg'): ISVGLayer;
  insertAfter(type: 'svg-static'): ISVGStaticLayer;
  insertAfter(type: IRenderFunction): ICanvasLayer;
  insertAfter(type: 'html'): IHTMLLayer;
  insertAfter(type: 'html-static'): IHTMLStaticLayer;
  insertAfter(type: 'svg' | 'html' | IRenderFunction | 'svg-static' | 'html-static') {
    return this.adapter.insert('after', this, type);
  }
}
