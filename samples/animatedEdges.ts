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

  function getOrSet<T>(elem: cytoscape.NodeSingular | cytoscape.EdgeSingular, key: string, value: () => T): T {
    const v = elem.scratch(key);
    if (v != null) {
      return v;
    }
    const vSet = value();
    elem.scratch(key, vSet);
    return vSet;
  }
  const layers = CytoscapeLayers.layers(cy);

  const layer = layers.nodeLayer.insertBefore('canvas');

  function animateEdges(options: {
    direction: 'alternate' | 'forward' | 'backward';
    mode: 'speed' | 'duration';
    modeValue: number;
    randomOffset: boolean;
  }) {
    function dist(start: { x: number; y: number }, end: { x: number; y: number }) {
      return Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2);
    }
    function computeFactor(
      elapsed: number,
      offset: number,
      start: { x: number; y: number },
      end: { x: number; y: number }
    ) {
      const duration = options.mode === 'duration' ? options.modeValue : dist(start, end) / options.modeValue;
      if (!Number.isFinite(duration) || Number.isNaN(duration)) {
        return 0;
      }
      let f = elapsed / duration;
      if (options.direction === 'alternate') {
        f = f / 2 + offset;
        const v = 2 * (f - Math.floor(f) - 0.5);
        return Math.abs(v);
      }
      f += offset;
      const v = f - Math.floor(f);
      return options.direction === 'forward' ? v : 1 - v;
    }

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
    layers.renderPerEdge(
      layer,
      (ctx, edge, path, start, end) => {
        const offset = options.randomOffset ? getOrSet(edge, '_animOffset', () => Math.random()) : 0;
        const g = ctx.createLinearGradient(start.x, start.y, end.x, end.y);

        const v = computeFactor(elapsed, offset, start, end);

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

    document.getElementById('png')?.addEventListener('click', () => {
      cy.png({
        output: 'blob-promise',
      }).then((r) => {
        const url = URL.createObjectURL(r);
        const a = document.getElementById('url') as HTMLAnchorElement;
        a.href = url;
        a.click();
      });
    });
  }

  cy.one('ready', () => {
    animateEdges({
      // mode: 'duration',
      // modeValue: 2000, //ms
      mode: 'speed',
      modeValue: 0.2, // pixel/ms
      direction: 'alternate',
      randomOffset: true,
    });
  });
}
