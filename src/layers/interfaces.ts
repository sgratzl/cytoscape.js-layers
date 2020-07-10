export interface ILayerContainer {
  readonly node: HTMLDivElement | SVGSVGElement | HTMLCanvasElement;
  update(): void;
  resize(width: number, height: number): void;
  remove(): void;
  setViewport(tx: number, ty: number, zoom: number): void;
}
