import type cy from 'cytoscape';
import type { ICanvasLayer, IPoint } from '../layers';
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
  let edges = layer.cy.collection() as cy.EdgeCollection;
  let updateOnRenderOnceEnabled = false;
  const revaluateAndUpdateOnce = () => {
    if (updateOnRenderOnceEnabled) {
      return;
    }
    updateOnRenderOnceEnabled = true;
    layer.cy.one('render', () => {
      updateOnRenderOnceEnabled = false;
      edges = reevaluateCollection(edges);
      layer.update();
    });
  };

  const reevaluateCollection = (current: cy.EdgeCollection) => {
    // clean up old
    if (o.updateOn !== 'none' && o.updateOn !== 'render') {
      current.off(o.updateOn, undefined, layer.updateOnRenderOnce);
      current.sources().off(o.updateOn, undefined, layer.updateOnRenderOnce);
      current.targets().off(o.updateOn, undefined, layer.updateOnRenderOnce);
    }

    // init new
    const newEdges = layer.cy.edges(o.selector);
    o.initCollection(newEdges);
    if (o.updateOn !== 'none' && o.updateOn !== 'render') {
      newEdges.on(o.updateOn, layer.updateOnRenderOnce);
      newEdges.sources().on(o.updateOn, layer.updateOnRenderOnce);
      newEdges.targets().on(o.updateOn, layer.updateOnRenderOnce);
    }
    layer.updateOnRenderOnce();
    return newEdges;
  };

  if (o.updateOn === 'render') {
    layer.updateOnRender = true;
  } else {
    edges = reevaluateCollection(edges);
    layer.cy.on('add remove', o.selector, revaluateAndUpdateOnce);
  }

  const renderer = (ctx: CanvasRenderingContext2D) => {
    if (o.queryEachTime) {
      edges = reevaluateCollection(edges);
    }
    edges.forEach((edge) => {
      if (edge.removed()) {
        return;
      }
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
      if (o.updateOn !== 'none' && o.updateOn !== 'render') {
        edges.off(o.updateOn, undefined, layer.updateOnRenderOnce);
        edges.sources().off(o.updateOn, undefined, layer.updateOnRenderOnce);
        edges.targets().off(o.updateOn, undefined, layer.updateOnRenderOnce);
      }
      layer.cy.off('add remove', o.selector, revaluateAndUpdateOnce);
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
