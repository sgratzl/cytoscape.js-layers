import { ICanvasLayer, ILayerElement, ILayerImpl, IRenderFunction } from './interfaces';
import { layerStyle } from './utils';
import { ABaseLayer, ILayerAdapter } from './ABaseLayer';

export class CanvasLayer extends ABaseLayer implements ICanvasLayer, ILayerImpl {
  readonly type = 'canvas';
  readonly node: HTMLCanvasElement & ILayerElement;
  readonly ctx: CanvasRenderingContext2D;
  private readonly pixelRatio: number;

  constructor(
    adapter: ILayerAdapter,
    doc: Document,
    private readonly render: IRenderFunction,
    options: Partial<CanvasRenderingContext2DSettings & { pixelRatio: number }> = {}
  ) {
    super(adapter);
    this.node = (doc.createElement('canvas') as unknown) as HTMLCanvasElement & ILayerElement;
    this.node.__cy_layer = this;
    Object.assign(this.node.style, layerStyle);
    this.pixelRatio = options.pixelRatio ?? (window ?? {}).devicePixelRatio ?? 1;
    this.ctx = this.node.getContext('2d', options)!;
  }

  get root() {
    return this.node;
  }

  clear() {
    const ctx = this.ctx;
    const bak = ctx.getTransform();
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(bak);
  }

  readonly draw = () => {
    this.clear();
    this.ctx.save();

    this.render(this.ctx);

    this.ctx.restore();
  };

  resize(width: number, height: number) {
    this.node.width = width * this.pixelRatio;
    this.node.height = height * this.pixelRatio;
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
