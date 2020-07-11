import cy from 'cytoscape';

export interface IRenderFunction {
  (ctx: CanvasRenderingContext2D): void;
}

export interface INodeUpdateFunction {
  (node: HTMLElement): void;
}

export interface ISVGNodeUpdateFunction {
  (node: SVGElement): void;
}

export interface ILayerDescFunction {
  (type: 'svg'): ISVGLayer;
  (type: 'svg-static'): ISVGStaticLayer;
  (type: 'canvas'): ICanvasLayer;
  (type: 'canvas-static'): ICanvasStaticLayer;
  (type: 'html'): IHTMLLayer;
  (type: 'html-static'): IHTMLStaticLayer;
}

export interface IMoveAbleLayer {
  readonly cy: cy.Core;

  moveUp(): void;
  moveDown(): void;
  moveBack(): void;
  moveFront(): void;

  insertBefore: ILayerDescFunction;
  insertAfter: ILayerDescFunction;
}

export interface ICustomLayer extends IMoveAbleLayer {
  remove(): void;

  updateOnRender: boolean;
  update(): void;
}

export interface ISVGLayer extends ICustomLayer {
  readonly type: 'svg';
  readonly node: SVGElement;

  readonly callbacks: ISVGNodeUpdateFunction[];
  callback(callback: ISVGNodeUpdateFunction): ISVGLayer;
}

export interface ISVGStaticLayer extends ICustomLayer {
  readonly type: 'svg-static';
  readonly node: SVGElement;

  readonly callbacks: ISVGNodeUpdateFunction[];
  callback(callback: ISVGNodeUpdateFunction): ISVGStaticLayer;
}

export interface ICanvasLayer extends ICustomLayer {
  readonly type: 'canvas';

  readonly callbacks: IRenderFunction[];
  callback(callback: IRenderFunction): ICanvasLayer;
}

export interface ICanvasStaticLayer extends ICustomLayer {
  readonly type: 'canvas-static';

  readonly callbacks: IRenderFunction[];
  callback(callback: IRenderFunction): ICanvasStaticLayer;
}

export interface IHTMLLayer extends ICustomLayer {
  readonly type: 'html';
  readonly node: HTMLElement;

  readonly callbacks: INodeUpdateFunction[];
  callback(callback: INodeUpdateFunction): IHTMLLayer;
}

export interface IHTMLStaticLayer extends ICustomLayer {
  readonly type: 'html-static';
  readonly node: HTMLElement;

  readonly callbacks: INodeUpdateFunction[];
  callback(callback: INodeUpdateFunction): IHTMLStaticLayer;
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
  | ICanvasLayer
  | ICanvasStaticLayer;

export interface ILayerElement {
  __cy_layer: ILayer & ILayerImpl;
}

export interface ILayerImpl {
  readonly root: HTMLElement | SVGSVGElement;
  resize(width: number, height: number): void;
  remove(): void;
  setViewport(tx: number, ty: number, zoom: number): void;
}
