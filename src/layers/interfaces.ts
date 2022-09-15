import type { ILayer } from './public';

export * from './public';

export interface ILayerElement {
  __cy_layer: ILayer & ILayerImpl;
}

export interface IRenderHint {
  scale: number;
  width: number;
  height: number;
  full: boolean;
}

export interface ILayerImpl {
  readonly root: HTMLElement | SVGElement;
  resize(width: number, height: number): void;
  remove(): void;
  setViewport(tx: number, ty: number, zoom: number): void;

  supportsRender(): boolean;
  renderInto(ctx: CanvasRenderingContext2D, hint: IRenderHint): void;
}
