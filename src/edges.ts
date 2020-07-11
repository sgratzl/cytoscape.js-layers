import cy from 'cytoscape';
import { ICanvasLayer } from './layers';
import { ICallbackRemover, registerCallback } from './utils';

export interface IEdgeLayerOption {
  selector: string;
  updateOnRender: boolean;
  queryEachTime: boolean;
}

const defaultOptions: IEdgeLayerOption = {
  selector: ':visible',
  updateOnRender: true,
  queryEachTime: false,
};

export function renderPerEdge(
  layer: ICanvasLayer,
  render: (ctx: CanvasRenderingContext2D, node: cy.EdgeSingular, path: Path2D) => void,
  options?: Partial<IEdgeLayerOption>
): ICallbackRemover {
  const o = Object.assign({}, defaultOptions, options);
  const edges = o.queryEachTime ? null : layer.cy.edges(o.selector);

  if (o.updateOnRender) {
    layer.updateOnRender = true;
  }

  const renderer = (ctx: CanvasRenderingContext2D) => {
    (edges || layer.cy.edges(o.selector)).forEach((edge) => {
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
  return registerCallback(layer, renderer);
}
