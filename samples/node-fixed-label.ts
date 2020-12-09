/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace NodeFixedHTMLLabels {
  declare const cytoscape: typeof import('cytoscape');
  declare const CytoscapeLayers: typeof import('../build');

  const cy = cytoscape({
    container: document.getElementById('app'),
    layout: {
      name: 'grid',
    },
    elements: [
      ...Array(100)
        .fill(0)
        .map((_, i) => ({ data: { id: `i${i}`, label: `L${i}` } })),
    ],
  });
  const layers = CytoscapeLayers.layers(cy);
  // render centered labels on each node
  layers.renderPerNode(
    layers.append('html'),
    (elem) => {
      elem.style.transform = `${elem.style.transform}scale(${1 / cy.zoom()})`;
    },
    {
      init: (elem, node) => {
        elem.classList.add('node-label');
        elem.textContent = node.data('label') || node.id();
      },
      transform: 'translate(-50%,-50%)',
      position: 'center',
      uniqueElements: true,
      checkBounds: true,
    }
  );
}
