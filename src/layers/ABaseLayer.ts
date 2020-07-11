import { ICanvasLayer, IHTMLLayer, IMoveAbleLayer, ISVGLayer, ILayer, IRenderFunction } from './interfaces';

export interface ILayerAdapter {
  move(layer: IMoveAbleLayer, offset: number): void;
  insert(where: 'before' | 'after', layer: IMoveAbleLayer, type: 'svg' | 'html' | IRenderFunction): ILayer;
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
  insertBefore(type: IRenderFunction): ICanvasLayer;
  insertBefore(type: 'html'): IHTMLLayer;
  insertBefore(type: 'svg' | 'html' | IRenderFunction) {
    return this.adapter.insert('before', this, type);
  }

  insertAfter(type: 'svg'): ISVGLayer;
  insertAfter(type: IRenderFunction): ICanvasLayer;
  insertAfter(type: 'html'): IHTMLLayer;
  insertAfter(type: 'svg' | 'html' | IRenderFunction) {
    return this.adapter.insert('after', this, type);
  }
}
