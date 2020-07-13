import cy from 'cytoscape';
import { ICanvasLayer, IHTMLLayer, ISVGLayer, ILayer } from '../layers';
import { SVG_NS } from '../layers/SVGLayer';
import { matchNodes, registerCallback, ICallbackRemover } from './utils';
import { IElementLayerOptions, defaultElementLayerOptions } from './common';

export interface INodeLayerOption extends IElementLayerOptions {
  boundingBox: cy.BoundingBoxOptions;
}

export interface INodeDOMLayerOption<T extends HTMLElement | SVGElement> extends INodeLayerOption {
  /**
   * whether to use unique DOM elements per node (id), similar to D3 key argument
   * @default false
   */
  uniqueElements: boolean;
  /**
   * init function for newly created DOM elements
   * @param elem
   * @param node
   */
  init(elem: T, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH): void;
}

export interface IRenderPerNodeResult extends ICallbackRemover {
  layer: ILayer;
  nodes: cy.NodeCollection;
}

export function renderPerNode(
  layer: ICanvasLayer,
  render: (ctx: CanvasRenderingContext2D, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => void,
  options?: Partial<INodeLayerOption>
): IRenderPerNodeResult;
export function renderPerNode(
  layer: IHTMLLayer,
  render: (elem: HTMLElement, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => void,
  options?: Partial<INodeDOMLayerOption<HTMLElement>>
): IRenderPerNodeResult;
export function renderPerNode(
  layer: ISVGLayer,
  render: (elem: SVGElement, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => void,
  options?: Partial<INodeDOMLayerOption<SVGElement>>
): IRenderPerNodeResult;
export function renderPerNode(
  layer: ICanvasLayer | IHTMLLayer | ISVGLayer,
  render: (ctx: any, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => void,
  options: Partial<INodeDOMLayerOption<any>> = {}
): IRenderPerNodeResult {
  const o = Object.assign(
    {
      boundingBox: {
        includeLabels: false,
        includeOverlays: false,
      },
    },
    defaultElementLayerOptions(options),
    options
  );
  const nodes = o.queryEachTime ? layer.cy.collection() : layer.cy.nodes(o.selector);
  if (o.updateOn === 'render') {
    layer.updateOnRender = true;
  } else if (o.updateOn === 'position') {
    nodes.on('position add remove', layer.update);
  } else {
    nodes.on('add remove', layer.update);
  }

  const re = (v: ICallbackRemover): IRenderPerNodeResult => ({
    layer,
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
        if (o.checkBounds && !layer.isVisible(bb)) {
          return;
        }
        ctx.translate(bb.x1, bb.y1);
        render(ctx, node, bb);
        ctx.setTransform(t);
      });
    };
    return re(registerCallback(layer, renderer));
  }
  const bb = (node: cy.NodeSingular) => node.boundingBox(o.boundingBox);
  const isVisible = o.checkBounds ? (bb: cy.BoundingBox12 & cy.BoundingBoxWH) => layer.isVisible(bb) : () => true;

  if (layer.type === 'html') {
    const enter = (node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => {
      const r = layer.node.ownerDocument.createElement('div');
      r.style.position = 'absolute';
      if (o.init) {
        o.init(r, node, bb);
      }
      return r;
    };
    if (!o.queryEachTime) {
      matchNodes(layer.node, nodes, {
        bb,
        isVisible,
        enter,
        update: () => undefined,
        uniqueElements: o.uniqueElements === true,
      });
    }
    const renderer = (root: HTMLElement) => {
      const currentNodes = o.queryEachTime ? layer.cy.nodes(o.selector) : nodes;

      matchNodes(root, currentNodes, {
        bb,
        isVisible,
        enter,
        update: (elem, node, bb) => {
          elem.style.transform = `translate(${bb.x1}px,${bb.y1}px)`;
          render(elem, node, bb);
        },
        uniqueElements: o.uniqueElements === true,
      });
    };
    return re(registerCallback(layer, renderer));
  }

  // if (layer.type === 'svg') {
  const enter = (node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => {
    const r = layer.node.ownerDocument.createElementNS(SVG_NS, 'g');
    if (o.init) {
      o.init(r, node, bb);
    }
    return r;
  };
  if (!o.queryEachTime) {
    matchNodes(layer.node, nodes, {
      bb,
      isVisible,
      enter,
      update: () => undefined,
      uniqueElements: o.uniqueElements === true,
    });
  }
  const renderer = (root: SVGElement) => {
    const currentNodes = o.queryEachTime ? layer.cy.nodes(o.selector) : nodes;
    matchNodes(root, currentNodes, {
      bb,
      isVisible,
      enter,
      update: (elem, node, bb) => {
        elem.setAttribute('transform', `translate(${bb.x1},${bb.y1})`);
        render(elem, node, bb);
      },
      uniqueElements: o.uniqueElements === true,
    });
  };
  return re(registerCallback(layer, renderer));
}
