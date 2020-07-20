import cy from 'cytoscape';
import { ICanvasLayer, IHTMLLayer, ISVGLayer, ILayer } from '../layers';
import { SVG_NS } from '../layers/SVGLayer';
import { matchNodes, registerCallback, ICallbackRemover, IMatchOptions } from './utils';
import { IElementLayerOptions, defaultElementLayerOptions } from './common';

export interface INodeLayerOption extends IElementLayerOptions {
  /**
   * how to compute the bounding box
   */
  boundingBox: cy.BoundingBoxOptions;
  /**
   * where to position the canvas / node relative to a node
   */
  position: 'none' | 'top-left' | 'center';
  /**
   * init function for the collection
   * @param nodes
   */
  initCollection(nodes: cy.NodeCollection): void;
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

  /**
   * additional transform to apply to a node
   */
  transform?: string;
}

export interface INodeCanvasLayerOption extends INodeLayerOption {
  /**
   * init function for newly added node
   * @param elem
   * @param node
   */
  init(node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH): void;
}

export interface IRenderPerNodeResult extends ICallbackRemover {
  layer: ILayer;
  nodes: cy.NodeCollection;
}

export function renderPerNode(
  layer: ICanvasLayer,
  render: (ctx: CanvasRenderingContext2D, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => void,
  options?: Partial<INodeCanvasLayerOption>
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
  options: Partial<INodeDOMLayerOption<any> | INodeCanvasLayerOption> = {}
): IRenderPerNodeResult {
  const o = Object.assign(
    {
      transform: '',
      position: 'top-left',
      boundingBox: {
        includeLabels: false,
        includeOverlays: false,
      },
      uniqueElements: false,
      initCollection: () => undefined,
    },
    defaultElementLayerOptions(options),
    options
  );
  const nodes = o.queryEachTime ? layer.cy.collection() : layer.cy.nodes(o.selector);
  if (!o.queryEachTime) {
    o.initCollection(nodes);
  }
  if (o.updateOn === 'render') {
    layer.updateOnRender = true;
  } else if (o.updateOn === 'position') {
    nodes.on('position add remove', layer.update);
  } else {
    nodes.on('add remove', layer.update);
  }

  const wrapResult = (v: ICallbackRemover): IRenderPerNodeResult => ({
    layer,
    nodes,
    remove: () => {
      nodes.off('position add remove', undefined, layer.update);
      v.remove();
    },
  });

  if (layer.type === 'canvas') {
    const oCanvas = o as INodeCanvasLayerOption;
    const renderer = (ctx: CanvasRenderingContext2D) => {
      const t = ctx.getTransform();
      const currentNodes = oCanvas.queryEachTime ? layer.cy.nodes(oCanvas.selector) : nodes;
      if (o.queryEachTime) {
        o.initCollection(currentNodes);
      }
      currentNodes.forEach((node) => {
        const bb = node.boundingBox(o.boundingBox);
        if (oCanvas.checkBounds && !layer.inVisibleBounds(bb)) {
          return;
        }
        if (oCanvas.position === 'top-left') {
          ctx.translate(bb.x1, bb.y1);
        } else if (oCanvas.position === 'center') {
          const pos = node.position();
          ctx.translate(pos.x, pos.y);
        }
        render(ctx, node, bb);
        if (oCanvas.position !== 'none') {
          ctx.setTransform(t);
        }
      });
    };
    return wrapResult(registerCallback(layer, renderer));
  }

  const oDOM = o as INodeDOMLayerOption<any>;
  // HTML or SVG
  const baseOptions = {
    bb: (node: cy.NodeSingular) => node.boundingBox(oDOM.boundingBox),
    isVisible: oDOM.checkBounds ? (bb: cy.BoundingBox12 & cy.BoundingBoxWH) => layer.inVisibleBounds(bb) : () => true,
    uniqueElements: oDOM.uniqueElements === true,
  };
  if (oDOM.checkBounds) {
    layer.updateOnTransform = true;
  }

  if (layer.type === 'html') {
    const matchOptions: IMatchOptions<HTMLElement> = {
      ...baseOptions,
      enter: (node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => {
        const r = layer.node.ownerDocument.createElement('div');
        r.style.position = 'absolute';
        if (oDOM.init) {
          oDOM.init(r, node, bb);
        }
        return r;
      },
      update: (elem, node, bb) => {
        if (oDOM.position === 'top-left') {
          elem.style.transform = `${oDOM.transform}translate(${bb.x1}px,${bb.y1}px)`;
        } else if (oDOM.position === 'center') {
          const pos = node.position();
          elem.style.transform = `${oDOM.transform}translate(${pos.x}px,${pos.y}px)`;
        }
        render(elem, node, bb);
      },
    };
    const renderer = (root: HTMLElement) => {
      const currentNodes = oDOM.queryEachTime ? layer.cy.nodes(oDOM.selector) : nodes;
      if (o.queryEachTime) {
        o.initCollection(currentNodes);
      }
      matchNodes(root, currentNodes, matchOptions);
    };
    return wrapResult(registerCallback(layer, renderer));
  }

  // if (layer.type === 'svg') {
  const matchOptions: IMatchOptions<SVGElement> = {
    ...baseOptions,
    enter: (node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => {
      const r = layer.node.ownerDocument.createElementNS(SVG_NS, 'g');
      if (oDOM.init) {
        oDOM.init(r, node, bb);
      }
      return r;
    },
    update: (elem, node, bb) => {
      if (oDOM.position === 'top-left') {
        elem.setAttribute('transform', `${oDOM.transform}translate(${bb.x1},${bb.y1})`);
      } else if (oDOM.position === 'center') {
        const pos = node.position();
        elem.setAttribute('transform', `${oDOM.transform}translate(${pos.x},${pos.y})`);
      }
      render(elem, node, bb);
    },
  };
  const renderer = (root: SVGElement) => {
    const currentNodes = oDOM.queryEachTime ? layer.cy.nodes(oDOM.selector) : nodes;
    if (o.queryEachTime) {
      o.initCollection(currentNodes);
    }
    matchNodes(root, currentNodes, matchOptions);
  };
  return wrapResult(registerCallback(layer, renderer));
}
