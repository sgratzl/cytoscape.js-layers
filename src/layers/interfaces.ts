export interface IRenderFunction {
  (ctx: CanvasRenderingContext2D): void;
}

export interface IMoveAbleLayer {
  moveUp(): void;
  moveDown(): void;
  moveBack(): void;
  moveFront(): void;

  insertBefore(type: 'svg'): ISVGLayer;
  insertBefore(type: IRenderFunction): ICanvasLayer;
  insertBefore(type: 'html'): IHTMLLayer;

  insertAfter(type: 'svg'): ISVGLayer;
  insertAfter(type: IRenderFunction): ICanvasLayer;
  insertAfter(type: 'html'): IHTMLLayer;
}

export interface ICustomLayer extends IMoveAbleLayer {
  remove(): void;
}

export interface ISVGLayer extends ICustomLayer {
  readonly type: 'svg';
  readonly node: SVGGElement;
}

export interface ICanvasLayer extends ICustomLayer {
  readonly type: 'canvas';
  draw(): void;
}

export interface IHTMLLayer extends ICustomLayer {
  readonly type: 'html';
  readonly node: HTMLElement;
}

export interface ICytoscapeNodeLayer extends IMoveAbleLayer {
  readonly node: HTMLCanvasElement;
  readonly type: 'node';
}
export interface ICytoscapeDragLayer extends IMoveAbleLayer {
  readonly node: HTMLCanvasElement;
  readonly type: 'drag';
}
export interface ICytoscapeSelectBoxLayer extends IMoveAbleLayer {
  readonly node: HTMLCanvasElement;
  readonly type: 'select-box';
}

export type ILayer =
  | ICytoscapeNodeLayer
  | ICytoscapeDragLayer
  | ICytoscapeSelectBoxLayer
  | IHTMLLayer
  | ISVGLayer
  | ICanvasLayer;

export interface ILayerElement {
  __cy_layer: ILayer & ILayerImpl;
}

export interface ILayerImpl {
  readonly root: HTMLElement | SVGSVGElement;
  resize(width: number, height: number): void;
  remove(): void;
  setViewport(tx: number, ty: number, zoom: number): void;
}
