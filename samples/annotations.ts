/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Annotations {
  declare const cytoscape: typeof import('cytoscape');
  declare const CytoscapeLayers: typeof import('../build');

  const cy = cytoscape({
    container: document.getElementById('app'),
    elements: fetch('./grid-data.json').then((r) => r.json()),
    layout: {
      name: 'grid',
    },
  });

  const layers = CytoscapeLayers.layers(cy);

  function renderBar(ctx: CanvasRenderingContext2D, value: number, y: number, w: number, h: number) {
    ctx.fillRect(0, y, w * value, h);
    ctx.strokeRect(0, y, w, h);
  }

  function renderHistogram(ctx: CanvasRenderingContext2D, bins: number[], y: number, w: number, h: number) {
    const binWidth = w / bins.length;
    for (let i = 0; i < bins.length; i++) {
      const vi = bins[i];
      ctx.fillRect(i * binWidth, y + h * (1 - vi), binWidth, h * vi);
    }
    ctx.strokeRect(0, y, w, h);
  }

  cy.on('ready', () => {
    layers.renderPerNode(
      layers.nodeLayer.insertAfter('canvas'),
      (ctx, node, bb) => {
        const barValue: number = node.scratch('value') ?? Math.random();
        node.scratch('value', barValue);
        const histogram: number[] = node.scratch('bins') ?? [
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
        ];
        node.scratch('bins', histogram);

        ctx.fillStyle = 'white';
        ctx.fillRect(0, bb.h, bb.w, 20);

        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'red';
        renderBar(ctx, barValue, bb.h, bb.w, 5);
        ctx.fillStyle = 'green';
        renderHistogram(ctx, histogram, bb.h + 5, bb.w, 15);
      },
      {
        position: 'top-left',
        checkBounds: true,
      }
    );
  });

  console.log(layers);

  document.getElementById('png')?.addEventListener('click', () => {
    layers
      .png({
        output: 'blob-promise',
        ignoreUnsupportedLayerOrder: true,
      })
      .then((r) => {
        const url = URL.createObjectURL(r);
        const a = document.getElementById('url') as HTMLAnchorElement;
        a.href = url;
        a.click();
      });
  });
}
