export namespace Annotations {
  declare const cytoscape: typeof import('cytoscape');
  declare const CytoscapeLayers: typeof import('../dist');

  export const cy = cytoscape({
    container: document.getElementById('app'),
    elements: fetch('./grid-data.json').then((r) => r.json()),
    layout: {
      name: 'grid',
    },
  });

  const layers = CytoscapeLayers.layers(cy);

  console.log(layers);
}
