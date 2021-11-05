import type cy from 'cytoscape';

export interface IPoint {
  x: number;
  y: number;
}

export interface IRenderFunction {
  (ctx: CanvasRenderingContext2D): void;
}

export interface IDOMUpdateFunction<T extends HTMLElement | SVGElement> {
  (node: T): void;
}

export interface ILayerOptions {
  stopClicks?: boolean;
}

export type ISVGLayerOptions = ILayerOptions;
export type IHTMLLayerOptions = ILayerOptions;
export interface ICanvasLayerOptions extends ILayerOptions, Partial<CanvasRenderingContext2DSettings> {
  pixelRatio?: number;
}

export interface ILayerDescFunction {
  (type: 'svg', options?: ISVGLayerOptions): ISVGLayer;
  (type: 'svg-static', options?: ISVGLayerOptions): ISVGStaticLayer;
  (type: 'canvas', options?: ICanvasLayerOptions): ICanvasLayer;
  (type: 'canvas-static', options?: ICanvasLayerOptions): ICanvasStaticLayer;
  (type: 'html', options?: IHTMLLayerOptions): IHTMLLayer;
  (type: 'html-static', options?: IHTMLLayerOptions): IHTMLStaticLayer;
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
  hide(): void;
  show(): void;
  visible: boolean;

  updateOnRender: boolean;
  update(): void;
  updateOnRenderOnce(): void;
}

export interface ITransformedLayer extends ICustomLayer {
  /**
   * checks whether the given point in model coordinates is visible i.e., within the visible rendered bounds
   * @param point
   */
  inVisibleBounds(point: IPoint | cy.BoundingBox12): boolean;
}

export interface ISVGLayer extends ITransformedLayer {
  readonly type: 'svg';
  readonly node: SVGElement;
  updateOnTransform: boolean;

  readonly callbacks: IDOMUpdateFunction<SVGElement>[];
  callback(callback: IDOMUpdateFunction<SVGElement>): ISVGLayer;
}

export interface ISVGStaticLayer extends ICustomLayer {
  readonly type: 'svg-static';
  readonly node: SVGElement;

  readonly callbacks: IDOMUpdateFunction<SVGElement>[];
  callback(callback: IDOMUpdateFunction<SVGElement>): ISVGStaticLayer;
}
export interface ICanvasLayer extends ITransformedLayer {
  readonly type: 'canvas';

  readonly callbacks: IRenderFunction[];
  callback(callback: IRenderFunction): ICanvasLayer;
}

export interface ICanvasStaticLayer extends ICustomLayer {
  readonly type: 'canvas-static';

  readonly callbacks: IRenderFunction[];
  callback(callback: IRenderFunction): ICanvasStaticLayer;
}

export interface IHTMLLayer extends ITransformedLayer {
  readonly type: 'html';
  readonly node: HTMLElement;
  updateOnTransform: boolean;

  readonly callbacks: IDOMUpdateFunction<HTMLElement>[];
  callback(callback: IDOMUpdateFunction<HTMLElement>): IHTMLLayer;
}

export interface IHTMLStaticLayer extends ICustomLayer {
  readonly type: 'html-static';
  readonly node: HTMLElement;

  readonly callbacks: IDOMUpdateFunction<HTMLElement>[];
  callback(callback: IDOMUpdateFunction<HTMLElement>): IHTMLStaticLayer;
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
