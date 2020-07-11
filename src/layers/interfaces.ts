export interface IRenderFunction {
  (ctx: CanvasRenderingContext2D): void;
}

export interface ILayerDescFunction {
  (type: 'svg'): ISVGLayer;
  (type: 'svg-static'): ISVGStaticLayer;
  (type: IRenderFunction): ICanvasLayer;
  (type: 'html'): IHTMLLayer;
  (type: 'html-static'): IHTMLStaticLayer;
}

export interface IMoveAbleLayer {
  moveUp(): void;
  moveDown(): void;
  moveBack(): void;
  moveFront(): void;

  insertBefore: ILayerDescFunction;
  insertAfter: ILayerDescFunction;
}

export interface ICustomLayer extends IMoveAbleLayer {
  remove(): void;
}

export interface ISVGLayer extends ICustomLayer {
  readonly type: 'svg';
  readonly node: SVGElement;
}

export interface ISVGStaticLayer extends ICustomLayer {
  readonly type: 'svg-static';
  readonly node: SVGElement;
}

export interface ICanvasLayer extends ICustomLayer {
  readonly type: 'canvas';
  draw(): void;
}

export interface IHTMLLayer extends ICustomLayer {
  readonly type: 'html';
  readonly node: HTMLElement;
}

export interface IHTMLStaticLayer extends ICustomLayer {
  readonly type: 'html-static';
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
  | IHTMLStaticLayer
  | ISVGLayer
  | ISVGStaticLayer
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
