import cy from 'cytoscape';
import { ICanvasLayer, IPoint } from '../layers';
import { ICallbackRemover, registerCallback } from './utils';
import { IElementLayerOptions, defaultElementLayerOptions } from './common';

export interface IRenderPerEdgeResult extends ICallbackRemover {
  layer: ICanvasLayer;
  edges: cy.EdgeCollection;
}

export interface IEdgeLayerOptions extends IElementLayerOptions {
  checkBoundsPointCount: number;
  /**
   * init function for the collection
   * @param edges
   */
  initCollection(edges: cy.EdgeCollection): void;
}

export function renderPerEdge(
  layer: ICanvasLayer,
  render: (ctx: CanvasRenderingContext2D, edge: cy.EdgeSingular, path: Path2D, start: IPoint, end: IPoint) => void,
  options?: Partial<IEdgeLayerOptions>
): IRenderPerEdgeResult {
  const o: IEdgeLayerOptions = Object.assign(
    {
      checkBoundsPointCount: 5,
      initCollection: () => undefined,
    },
    defaultElementLayerOptions(options),
    options
  );
  const edges = o.queryEachTime ? layer.cy.collection() : layer.cy.edges(o.selector);
  if (!o.queryEachTime) {
    o.initCollection(edges);
  }

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
    if (o.queryEachTime) {
      o.initCollection(currentEdges);
    }
    currentEdges.forEach((edge) => {
      const impl = (edge as any)._private.rscratch as {
        pathCache: Path2D;
        startX?: number;
        startY?: number;
        endX?: number;
        endY?: number;
      };
      const s =
        impl && impl.startX != null && impl.startY != null ? { x: impl.startX, y: impl.startY } : edge.sourceEndpoint();
      const t = impl && impl.endX != null && impl.endY != null ? { x: impl.endX, y: impl.endY } : edge.targetEndpoint();

      if (o.checkBounds && o.checkBoundsPointCount > 0 && !anyVisible(layer, s, t, o.checkBoundsPointCount)) {
        return;
      }
      if (impl && impl.pathCache) {
        render(ctx, edge, impl.pathCache, s, t);
        return;
      }
      const path = new Path2D();
      path.moveTo(s.x, s.y);
      path.lineTo(t.x, t.y);
      render(ctx, edge, path, s, t);
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

function anyVisible(layer: ICanvasLayer, s: IPoint, t: IPoint, count: number) {
  const interpolate = (v: number) => ({
    x: s.x * v + t.x * (1 - v),
    y: s.y * v + t.y * (1 - v),
  });
  if (count === 1) {
    return layer.inVisibleBounds(interpolate(0.5));
  }
  const step = 1 / count;
  for (let i = 0; i <= count; i++) {
    if (layer.inVisibleBounds(interpolate(i * step))) {
      return true;
    }
  }
  return false;
}
