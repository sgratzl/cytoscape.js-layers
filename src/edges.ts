import cy from 'cytoscape';
import { ICanvasLayer } from './layers';
import { ICallbackRemover, registerCallback } from './utils';

export interface IEdgeLayerOption {
  selector: string;
  updateOn: 'render' | 'position' | 'auto';
  queryEachTime: boolean;
}

const defaultOptions: IEdgeLayerOption = {
  selector: ':visible',
  updateOn: 'auto',
  queryEachTime: false,
};

export interface IRenderPerEdgeResult extends ICallbackRemover {
  edges: cy.EdgeCollection;
}

export function renderPerEdge(
  layer: ICanvasLayer,
  render: (ctx: CanvasRenderingContext2D, node: cy.EdgeSingular, path: Path2D) => void,
  options?: Partial<IEdgeLayerOption>
): IRenderPerEdgeResult {
  const o = Object.assign({}, defaultOptions, options);
  const edges = o.queryEachTime ? layer.cy.collection() : layer.cy.edges(o.selector);

  const autoRender = o.updateOn === 'auto' ? (o.queryEachTime ? 'render' : 'position') : o.updateOn;
  if (autoRender === 'render') {
    layer.updateOnRender = true;
  } else if (autoRender === 'position') {
    edges.on('position add remove', layer.update);
  } else {
    edges.on('add remove', layer.update);
  }

  const renderer = (ctx: CanvasRenderingContext2D) => {
    const currentEdges = o.queryEachTime ? layer.cy.edges(o.selector) : edges;
    currentEdges.forEach((edge) => {
      const impl = (edge as any)._private.rscratch as {
        pathCache: Path2D;
        startX: number;
        startY: number;
        endX: number;
        endY: number;
      };
      if (impl && impl.pathCache) {
        render(ctx, edge, impl.pathCache);
      }
      const path = new Path2D();
      if (impl) {
        path.moveTo(impl.startX, impl.startY);
        path.lineTo(impl.endX, impl.endY);
      } else {
        const s = edge.sourceEndpoint();
        const t = edge.targetEndpoint();
        path.moveTo(s.x, s.y);
        path.lineTo(t.x, t.y);
      }
      render(ctx, edge, new Path2D());
    });
  };

  const r = registerCallback(layer, renderer);
  return {
    edges,
    remove: () => {
      edges.off('position add remove', undefined, layer.update);
      r.remove();
    },
  };
}
