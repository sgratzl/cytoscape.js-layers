export interface ILayer {}

export interface ILayerContainer {
  readonly node: HTMLDivElement | SVGSVGElement | HTMLCanvasElement;
  update(): void;
  resize(width: number, height: number): void;
  remove(): void;
  setViewport(tx: number, ty: number, zoom: number): void;
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export class SVGLayerContainer implements ILayerContainer {
  readonly node: SVGSVGElement;

  constructor(doc: Document) {
    this.node = doc.createElementNS(SVG_NAMESPACE, 'svg');
    this.node.appendChild(doc.createElementNS(SVG_NAMESPACE, 'g'));
  }

  resize(width: number, height: number) {
    this.node.style.width = `${width}px`;
    this.node.style.height = `${height}px`;
  }

  setViewport(tx: number, ty: number, zoom: number) {
    const g = this.node.firstElementChild! as SVGGElement;
    g.setAttribute('transform', `translate(${tx},${ty})scale(${zoom})`);
  }

  remove() {
    this.node.remove();
  }

  update() {
    // dummy
  }
}

export class DOMLayerContainer implements ILayerContainer {
  readonly node: HTMLDivElement;

  constructor(doc: Document) {
    this.node = doc.createElement('div');
    this.node.style.overflow = 'hidden';
  }

  resize(width: number, height: number) {
    this.node.style.width = `${width}px`;
    this.node.style.height = `${height}px`;
  }

  setViewport(tx: number, ty: number, zoom: number) {
    this.node.style.transform = `translate(${tx}px,${ty}px)scale(${zoom})`;
  }

  remove() {
    this.node.remove();
  }

  update() {
    // dummy
  }
}

export class CanvasLayerContainer implements ILayerContainer {
  readonly node: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private readonly pixelRatio: number;

  constructor(doc: Document, options: Partial<CanvasRenderingContext2DSettings & { pixelRatio: number }> = {}) {
    this.node = doc.createElement('canvas');
    this.pixelRatio = options.pixelRatio ?? (window ?? {}).devicePixelRatio ?? 1;
    this.ctx = this.node.getContext('2d', options)!;
  }

  resize(width: number, height: number) {
    this.node.width = width * this.pixelRatio;
    this.node.height = height * this.pixelRatio;
  }

  clearCanvas() {
    const ctx = this.ctx;
    const bak = ctx.getTransform();
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(bak);
  }

  update() {
    this.clearCanvas();
    this.ctx.save();

    // TODO

    this.ctx.restore();
  }

  setViewport(tx: number, ty: number, zoom: number) {
    this.ctx.resetTransform();
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
    this.ctx.translate(tx, ty);
    this.ctx.scale(zoom, zoom);
  }

  remove() {
    this.node.remove();
  }
}
