import cy from 'cytoscape';
import { ICanvasLayer } from '../layers';
import { ICallbackRemover, registerCallback } from './utils';
import { IElementLayerOptions, defaultElementLayerOptions } from './common';

export interface IRenderPerEdgeResult extends ICallbackRemover {
  layer: ICanvasLayer;
  edges: cy.EdgeCollection;
}

export function renderPerEdge(
  layer: ICanvasLayer,
  render: (ctx: CanvasRenderingContext2D, node: cy.EdgeSingular, path: Path2D) => void,
  options?: Partial<IElementLayerOptions>
): IRenderPerEdgeResult {
  const o = Object.assign({}, defaultElementLayerOptions(options), options);
  const edges = o.queryEachTime ? layer.cy.collection() : layer.cy.edges(o.selector);

  if (o.updateOn === 'render') {
    layer.updateOnRender = true;
  } else if (o.updateOn === 'position') {
    edges.on('position add remove', layer.update);
    edges.sources().on('position', layer.update);
    edges.targets().on('position', layer.update);
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
      if (o.checkBounds) {
        const s = impl ? { x: impl.startX, y: impl.startY } : edge.sourceEndpoint();
        const t = impl ? { x: impl.endX, y: impl.endY } : edge.targetEndpoint();
        if (!layer.inVisibleBounds(s) && !layer.inVisibleBounds(t)) {
          // both outside
          return;
        }
      }
      if (impl && impl.pathCache) {
        render(ctx, edge, impl.pathCache);
        return;
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
    layer,
    edges,
    remove: () => {
      edges.off('position add remove', undefined, layer.update);
      edges.sources().off('position', undefined, layer.update);
      edges.targets().off('position', undefined, layer.update);
      r.remove();
    },
  };
}
