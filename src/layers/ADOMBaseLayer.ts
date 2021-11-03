import type { ILayerElement } from './interfaces';
import type { IDOMUpdateFunction } from './public';
import { layerStyle } from './utils';
import { ABaseLayer, ILayerAdapter } from './ABaseLayer';

export abstract class ADOMBaseLayer<T extends HTMLElement | SVGElement> extends ABaseLayer {
  readonly root: T & ILayerElement;

  readonly callbacks: IDOMUpdateFunction<T>[] = [];

  constructor(adapter: ILayerAdapter, root: T) {
    super(adapter);
    this.root = root as unknown as T & ILayerElement;
    Object.assign(this.root.style, layerStyle);
  }

  abstract get node(): T;

  readonly update = () => {
    for (const o of this.callbacks) {
      o(this.node);
    }
  };

  get visible() {
    return this.root.style.display !== 'none';
  }

  set visible(value: boolean) {
    if (this.visible === value) {
      return;
    }
    this.root.style.display = value ? '' : 'none';
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  callback(callback: IDOMUpdateFunction<T>) {
    this.callbacks.push(callback);
    this.update();
    return this;
  }

  resize() {
    // dummy
  }

  remove() {
    this.root.remove();
  }
}
