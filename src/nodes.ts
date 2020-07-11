import cy from 'cytoscape';
import { ICanvasLayer, IHTMLLayer, ISVGLayer } from './layers';
import { SVG_NS } from './layers/SVGLayer';
import { matchNodes, registerCallback, ICallbackRemover } from './utils';

export interface INodeLayerOption {
  selector: string;
  updateOn: 'render' | 'position' | 'auto';
  queryEachTime: boolean;
  boundingBox: cy.BoundingBoxOptions;
}

const defaultOptions: INodeLayerOption = {
  selector: ':visible',
  updateOn: 'auto',
  queryEachTime: false,
  boundingBox: {
    includeLabels: false,
    includeOverlays: false,
  },
};

export interface IRenderPerNodeResult extends ICallbackRemover {
  nodes: cy.NodeCollection;
}

export function renderPerNode(
  layer: ICanvasLayer,
  render: (ctx: CanvasRenderingContext2D, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => void,
  options?: Partial<INodeLayerOption>
): ICallbackRemover;
export function renderPerNode(
  layer: IHTMLLayer,
  render: (elem: HTMLElement, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => void,
  options?: Partial<INodeLayerOption>
): ICallbackRemover;
export function renderPerNode(
  layer: ISVGLayer,
  render: (elem: SVGElement, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => void,
  options?: Partial<INodeLayerOption>
): ICallbackRemover;
export function renderPerNode(
  layer: ICanvasLayer | IHTMLLayer | ISVGLayer,
  render: (ctx: any, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => void,
  options: Partial<INodeLayerOption> = {}
): ICallbackRemover {
  const o = Object.assign({}, defaultOptions, options);
  const nodes = o.queryEachTime ? layer.cy.collection() : layer.cy.nodes(o.selector);

  const autoRender = o.updateOn === 'auto' ? (o.queryEachTime ? 'render' : 'position') : o.updateOn;
  if (autoRender === 'render') {
    layer.updateOnRender = true;
  } else if (autoRender === 'position') {
    nodes.on('position add remove', layer.update);
  } else {
    nodes.on('add remove', layer.update);
  }

  const re = (v: ICallbackRemover) => ({
    nodes,
    remove: () => {
      nodes.off('position add remove', undefined, layer.update);
      v.remove();
    },
  });

  if (layer.type === 'canvas') {
    const renderer = (ctx: CanvasRenderingContext2D) => {
      const t = ctx.getTransform();
      const currentNodes = o.queryEachTime ? layer.cy.nodes(o.selector) : nodes;
      currentNodes.forEach((node) => {
        const bb = node.boundingBox(o.boundingBox);
        ctx.translate(bb.x1, bb.y1);
        render(ctx, node, bb);
        ctx.setTransform(t);
      });
    };
    return re(registerCallback(layer, renderer));
  }

  if (layer.type === 'html') {
    const factory = () => {
      const r = layer.node.ownerDocument.createElement('div');
      r.style.position = 'absolute';
      return r;
    };
    if (!o.queryEachTime) {
      matchNodes(layer.node, nodes, factory);
    }
    const renderer = (root: HTMLElement) => {
      const currentNodes = o.queryEachTime ? layer.cy.nodes(o.selector) : nodes;
      if (o.queryEachTime) {
        matchNodes(root, currentNodes, factory);
      }
      currentNodes.forEach((node, i) => {
        const bb = node.boundingBox(o.boundingBox);
        const elem = root.children[i] as HTMLElement;
        elem.style.transform = `translate(${bb.x1}px,${bb.y1}px)`;
        render(elem, node, bb);
      });
    };
    return re(registerCallback(layer, renderer));
  }

  // if (layer.type === 'svg') {
  const factory = () => layer.node.ownerDocument.createElementNS(SVG_NS, 'g');
  if (!o.queryEachTime) {
    matchNodes(layer.node, nodes, factory);
  }
  const renderer = (root: SVGElement) => {
    const currentNodes = o.queryEachTime ? layer.cy.nodes(o.selector) : nodes;
    if (o.queryEachTime) {
      matchNodes(root, currentNodes, factory);
    }
    currentNodes.forEach((node, i) => {
      const bb = node.boundingBox(o.boundingBox);
      const elem = root.children[i] as HTMLElement;
      elem.setAttribute('transform', `translate(${bb.x1},${bb.y1})`);
      render(elem, node, bb);
    });
  };
  return re(registerCallback(layer, renderer));
}
