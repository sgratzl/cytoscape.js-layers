import { ILayerContainer } from './interfaces';
import { layerStyle } from './utils';

export class CanvasLayerContainer implements ILayerContainer {
  readonly node: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private readonly pixelRatio: number;
  private readonly layers: ((ctx: CanvasRenderingContext2D) => void)[] = [];

  constructor(doc: Document, options: Partial<CanvasRenderingContext2DSettings & { pixelRatio: number }> = {}) {
    this.node = doc.createElement('canvas');
    Object.assign(this.node.style, layerStyle);
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

  pushLayer(render: (ctx: CanvasRenderingContext2D) => void) {
    this.layers.push(render);
  }
}
