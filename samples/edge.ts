/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace AnimatedEdges {
  declare const cytoscape: typeof import('cytoscape');
  declare const CytoscapeLayers: typeof import('../build');

  const cy = cytoscape({
    container: document.getElementById('app'),
    elements: fetch('./grid-data.json').then((r) => r.json()),
    // elements: Promise.resolve([
    //   { data: { id: 'a' } },
    //   { data: { id: 'b' } },
    //   {
    //     data: {
    //       id: 'ab',
    //       source: 'a',
    //       target: 'b',
    //     },
    //   },
    // ]),
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

  layers.renderPerEdge(layer, (ctx, _, path) => {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke(path);
  });
}
