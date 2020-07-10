export interface ILayerContainer {
  readonly node: HTMLDivElement | SVGSVGElement | HTMLCanvasElement;
  resize(width: number, height: number): void;
  remove(): void;
  setViewport(tx: number, ty: number, zoom: number): void;

  indexOf(layer: ILayer): number;

  length: number;
}

export interface ILayerFunction {
  (type: 'svg'): ISVGLayer;
  (type: 'canvas', render: (ctx: CanvasRenderingContext2D) => void): ICanvasLayer;
  (type: 'html'): IHTMLLayer;
}

export interface IRelativeLayerFunction {
  (layer: ILayer, type: 'svg'): ISVGLayer;
  (layer: ILayer, type: 'canvas', render: (ctx: CanvasRenderingContext2D) => void): ICanvasLayer;
  (layer: ILayer, type: 'html'): IHTMLLayer;
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
  draw(): void;
}

export interface IHTMLLayer extends ICustomLayer {
  type: 'html';
  node: HTMLElement;
}

export interface ICytoscapeNodeLayer extends IMoveAbleLayer {
  node: HTMLCanvasElement;
  type: 'node';
}
export interface ICytoscapeDragLayer extends IMoveAbleLayer {
  node: HTMLCanvasElement;
  type: 'drag';
}
export interface ICytoscapeSelectBoxLayer extends IMoveAbleLayer {
  node: HTMLCanvasElement;
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
