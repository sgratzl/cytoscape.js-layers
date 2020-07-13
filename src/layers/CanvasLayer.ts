import { ICanvasLayer, ILayerElement, ILayerImpl, IRenderFunction, ICanvasStaticLayer } from './interfaces';
import { layerStyle, stopClicks } from './utils';
import { ABaseLayer, ILayerAdapter } from './ABaseLayer';
import { ICanvasLayerOptions } from './public';

export class CanvasBaseLayer extends ABaseLayer implements ILayerImpl {
  readonly node: HTMLCanvasElement & ILayerElement;
  readonly ctx: CanvasRenderingContext2D;
  protected readonly pixelRatio: number;
  readonly callbacks: IRenderFunction[] = [];
  protected readonly transform: { tx: number; ty: number; zoom: number } = {
    tx: 0,
    ty: 0,
    zoom: 1,
  };

  constructor(adapter: ILayerAdapter, doc: Document, options: ICanvasLayerOptions = {}) {
    super(adapter);
    this.node = (doc.createElement('canvas') as unknown) as HTMLCanvasElement & ILayerElement;
    Object.assign(this.node.style, layerStyle);
    if (options.stopClicks) {
      stopClicks(this.node);
    }
    this.pixelRatio = options.pixelRatio ?? (window ?? {}).devicePixelRatio ?? 1;
    this.ctx = this.node.getContext('2d', options)!;
    this.ctx.resetTransform();
  }

  get visible() {
    return this.node.style.display !== 'none';
  }

  set visible(value: boolean) {
    this.node.style.display = value ? '' : 'none';
  }
  show() {
    this.visible = true;
  }
  hide() {
    this.visible = false;
  }

  get root() {
    return this.node;
  }

  callback(callback: IRenderFunction) {
    this.callbacks.push(callback);
    this.update();
    return this;
  }

  readonly update = () => this.draw();

  clear() {
    const ctx = this.ctx;
    const bak = ctx.getTransform();
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(bak);
  }

  draw() {
    this.clear();
    this.ctx.save();
    this.ctx.resetTransform();
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
    this.ctx.translate(this.transform.tx, this.transform.ty);
    this.ctx.scale(this.transform.zoom, this.transform.zoom);

    for (const r of this.callbacks) {
      r(this.ctx);
    }

    this.ctx.restore();
  }

  resize(width: number, height: number) {
    this.node.width = width * this.pixelRatio;
    this.node.height = height * this.pixelRatio;
    this.update();
  }

  setViewport(_tx: number, _ty: number, _zoom: number) {
    // dummy
  }

  remove() {
    this.node.remove();
  }
}

export class CanvasLayer extends CanvasBaseLayer implements ICanvasLayer {
  readonly type = 'canvas';

  constructor(adapter: ILayerAdapter, doc: Document, options: ICanvasLayerOptions = {}) {
    super(adapter, doc, options);
    this.node.__cy_layer = this;
  }

  setViewport(tx: number, ty: number, zoom: number) {
    this.transform.tx = tx;
    this.transform.ty = ty;
    this.transform.zoom = zoom;
    this.update();
  }
}

export class CanvasStaticLayer extends CanvasBaseLayer implements ICanvasStaticLayer {
  readonly type = 'canvas-static';

  constructor(adapter: ILayerAdapter, doc: Document, options: ICanvasLayerOptions = {}) {
    super(adapter, doc, options);
    this.node.__cy_layer = this;
  }
}
