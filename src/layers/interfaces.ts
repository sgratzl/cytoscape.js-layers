export interface ILayerContainer {
  readonly node: HTMLDivElement | SVGSVGElement | HTMLCanvasElement;
  resize(width: number, height: number): void;
  remove(): void;
  setViewport(tx: number, ty: number, zoom: number): void;

  indexOf(layer: ILayer): number;

  length: number;
}

export interface IMoveAbleLayer {
  moveUp(): void;
  moveDown(): void;
  moveBack(): void;
  moveFront(): void;

  insertBefore(type: 'svg'): ISVGLayer;
  insertBefore(type: 'canvas', render: (ctx: CanvasRenderingContext2D) => void): ICanvasLayer;
  insertBefore(type: 'html'): IHTMLLayer;

  insertAfter(type: 'svg'): ISVGLayer;
  insertAfter(type: 'canvas', render: (ctx: CanvasRenderingContext2D) => void): ICanvasLayer;
  insertAfter(type: 'html'): IHTMLLayer;
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
  container?: ILayerContainer;
};
