import cy from 'cytoscape';
import { ICanvasLayer, IHTMLLayer, ISVGLayer } from './layers';
import { SVG_NS } from './layers/SVGLayer';
import { matchNodes, registerCallback, ICallbackRemover } from './utils';

export interface INodeLayerOption {
  selector: string;
  updateOnRender: boolean;
  queryEachTime: boolean;
  boundingBox: cy.BoundingBoxOptions;
}

const defaultOptions: INodeLayerOption = {
  selector: ':visible',
  updateOnRender: true,
  queryEachTime: false,
  boundingBox: {
    includeLabels: false,
    includeOverlays: false,
  },
};

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
  const nodes = o.queryEachTime ? null : layer.cy.nodes(o.selector);

  if (o.updateOnRender) {
    layer.updateOnRender = true;
  }

  if (layer.type === 'canvas') {
    const renderer = (ctx: CanvasRenderingContext2D) => {
      const t = ctx.getTransform();
      (nodes || layer.cy.nodes(o.selector)).forEach((node) => {
        const bb = node.boundingBox(o.boundingBox);
        ctx.translate(bb.x1, bb.y1);
        render(ctx, node, bb);
        ctx.setTransform(t);
      });
    };
    return registerCallback(layer, renderer);
  }

  if (layer.type === 'html') {
    const factory = () => {
      const r = layer.node.ownerDocument.createElement('div');
      r.style.position = 'absolute';
      return r;
    };
    if (nodes) {
      matchNodes(layer.node, nodes, factory);
    }
    const renderer = (root: HTMLElement) => {
      const currentNodes = nodes || layer.cy.nodes(o.selector);
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
    return registerCallback(layer, renderer);
  }

  // if (layer.type === 'svg') {
  const factory = () => layer.node.ownerDocument.createElementNS(SVG_NS, 'g');
  if (nodes) {
    matchNodes(layer.node, nodes, factory);
  }
  const renderer = (root: SVGElement) => {
    const currentNodes = nodes || layer.cy.nodes(o.selector);
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
  return registerCallback(layer, renderer);
}
