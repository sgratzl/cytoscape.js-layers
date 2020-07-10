export interface ILayerContainer {
  readonly node: HTMLDivElement | SVGSVGElement | HTMLCanvasElement;
  update(): void;
  resize(width: number, height: number): void;
  remove(): void;
  setViewport(tx: number, ty: number, zoom: number): void;
}

export interface ILayerFunction {
  (type: 'svg'): ISVGLayer;
  (type: 'canvas', render: (ctx: CanvasRenderingContext2D) => void): ICanvasLayer;
  (type: 'html'): IHTMLLayer;
}

export interface IRelativeLayerFunction {
  (layer: ICustomLayer, type: 'svg'): ISVGLayer;
  (layer: ICustomLayer, type: 'canvas', render: (ctx: CanvasRenderingContext2D) => void): ICanvasLayer;
  (layer: ICustomLayer, type: 'html'): IHTMLLayer;
}

export interface IMoveAbleLayer {
  moveUp(): void;
  moveDown(): void;
  moveBack(): void;
  moveFront(): void;

  insertBefore: ILayerFunction;
  insertAfter: ILayerFunction;
}

export interface ICustomLayer extends IMoveAbleLayer {
  remove(): void;
}

export interface ISVGLayer extends ICustomLayer {
  type: 'svg';
  node: SVGGElement;
}

export interface ICanvasLayer extends ICustomLayer {
  type: 'canvas';
  render: (ctx: CanvasRenderingContext2D) => void;
}

export interface IHTMLLayer extends ICustomLayer {
  type: 'html';
  node: HTMLElement;
}

export interface ICytoscapeNodeLayer extends IMoveAbleLayer {
  type: 'node';
}
export interface ICytoscapeDragLayer extends IMoveAbleLayer {
  type: 'drag';
}
export interface ICytoscapeSelectBoxLayer extends IMoveAbleLayer {
  type: 'select-box';
}

export type ILayer =
  | ICytoscapeNodeLayer
  | ICytoscapeDragLayer
  | ICytoscapeSelectBoxLayer
  | IHTMLLayer
  | ISVGLayer
  | ICanvasLayer;

export type IContainerLayer = ILayer & {
  container: ILayerContainer | null;
};
