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

export interface ITransformedLayer extends ICustomLayer {
  /**
   * checks whether the given point in model coordinates is visible i.e., within the visible rendered bounds
   * @param point
   */
  isVisible(point: { x: number; y: number } | cy.BoundingBox12): boolean;
}

export interface ISVGLayer extends ITransformedLayer {
  readonly type: 'svg';
  readonly node: SVGElement;
  updateOnTransform: boolean;

  readonly callbacks: ISVGNodeUpdateFunction[];
  callback(callback: ISVGNodeUpdateFunction): ISVGLayer;
}

export interface ISVGStaticLayer extends ICustomLayer {
  readonly type: 'svg-static';
  readonly node: SVGElement;

  readonly callbacks: ISVGNodeUpdateFunction[];
  callback(callback: ISVGNodeUpdateFunction): ISVGStaticLayer;
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
