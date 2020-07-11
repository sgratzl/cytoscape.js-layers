import { ILayerContainer, ILayer, ICanvasLayer } from './interfaces';
import { layerStyle } from './utils';

export class CanvasLayerContainer implements ILayerContainer {
  readonly node: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private readonly pixelRatio: number;
  readonly layers: { draw: () => void; render: (ctx: CanvasRenderingContext2D) => void }[] = [];

  constructor(doc: Document, options: Partial<CanvasRenderingContext2DSettings & { pixelRatio: number }> = {}) {
    this.node = doc.createElement('canvas');
    Object.assign(this.node.style, layerStyle);
    this.pixelRatio = options.pixelRatio ?? (window ?? {}).devicePixelRatio ?? 1;
    this.ctx = this.node.getContext('2d', options)!;
  }

  get length() {
    return this.layers.length;
  }

  indexOf(layer: ILayer) {
    if (layer.type !== 'canvas') {
      return -1;
    }
    return this.layers.findIndex((d) => d.draw === layer.draw);
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

  readonly draw = () => {
    this.clearCanvas();
    this.ctx.save();

    for (const layer of this.layers) {
      layer.render(this.ctx);
    }

    this.ctx.restore();
  };

  setViewport(tx: number, ty: number, zoom: number) {
    this.ctx.resetTransform();
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
    this.ctx.translate(tx, ty);
    this.ctx.scale(zoom, zoom);
  }

  remove() {
    this.node.remove();
  }

  pushLayer(render: (ctx: CanvasRenderingContext2D) => void, draw = () => this.draw()) {
    this.layers.push({ draw, render });
    return draw;
  }

  removeLayer(draw: () => void) {
    const index = this.layers.findIndex((d) => d.draw === draw);
    if (index < 0) {
      return;
    }
    this.layers.splice(index, 1);
  }

  layer(
    where: 'before' | 'after',
    ref: ILayer | null,
    render: (ctx: CanvasRenderingContext2D) => void,
    draw = () => this.draw()
  ) {
    const l = { draw, render };
    if (ref) {
      const index = this.layers.findIndex((d) => d.draw === (ref as ICanvasLayer).draw);
      this.layers.splice(where === 'before' ? index : index + 1, 0, l);
    } else if (where === 'before') {
      this.layers.unshift(l);
    } else {
      this.layers.push(l);
    }
    return {
      type: 'canvas' as 'canvas',
      draw,
      container: this,
    };
  }
}
