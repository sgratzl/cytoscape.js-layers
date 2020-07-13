import { ILayer } from './public';

export * from './public';

export interface ILayerElement {
  __cy_layer: ILayer & ILayerImpl;
}

export interface ILayerImpl {
  readonly root: HTMLElement | SVGElement;
  resize(width: number, height: number): void;
  remove(): void;
  setViewport(tx: number, ty: number, zoom: number): void;
}
