namespace AnimatedEdges {
  declare const cytoscape: typeof import('cytoscape');
  declare const CytoscapeLayers: typeof import('../dist');

  export const cy = cytoscape({
    container: document.getElementById('app'),
    // elements: fetch('./grid-data.json').then((r) => r.json()),
    elements: Promise.resolve([
      { data: { id: 'a' } },
      { data: { id: 'b' } },
      {
        data: {
          id: 'ab',
          source: 'a',
          target: 'b',
        },
      },
    ]),
    layout: {
      name: 'grid',
    },
    style: [
      {
        selector: 'edge',
        style: {
          'line-color': 'white',
          opacity: 0.01,
        },
      },
    ],
  });

  const layers = CytoscapeLayers.layers(cy);

  const layer = layers.nodeLayer.insertBefore('canvas');
  const duration = 2000;

  let start: number | null = null;
  let elapsed = 0;
  const update: FrameRequestCallback = (time: number) => {
    if (start == null) {
      start = time;
    }
    elapsed = time - start;
    layer.update();
    requestAnimationFrame(update);
  };
  cy.one('ready', () => {
    layers.renderPerEdge(
      layer,
      (ctx, edge, path, start, end) => {
        const offset = edge.scratch('_animOffset') ?? Math.random();
        edge.scratch('_animOffset', offset);
        const g = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        const factor = elapsed / duration + offset;
        const v = factor - Math.floor(factor);
        g.addColorStop(Math.max(v - 0.1, 0), 'black');
        g.addColorStop(v, 'white');
        g.addColorStop(Math.min(v + 0.1, 1), 'black');
        ctx.strokeStyle = g;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke(path);
      },
      {
        checkBounds: true,
        checkBoundsPointCount: 5,
      }
    );
    requestAnimationFrame(update);
  });
}
