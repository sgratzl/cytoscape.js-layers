/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace EdgeTypes {
  declare const cytoscape: typeof import('cytoscape');
  // declare const CytoscapeLayers: typeof import('../build');

  export const cy = cytoscape({
    container: document.getElementById('app'),
    layout: {
      name: 'cose',
    },
    elements: [
      ...Array.from('abcdefg').map((d) => ({ data: { id: d } })),
      ...['ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ga', 'fa', 'ea', 'da', 'ca', 'ba'].map((d) => ({
        data: { id: d, source: d[0], target: d[1] },
      })),
    ],
    style: [
      {
        selector: 'edge',
        style: {
          'line-color': 'black',
          opacity: 0.5,
        },
      },
      {
        selector: '#ab,#ba',
        style: {
          label: 'haystack',
          'curve-style': 'haystack',
        },
      },
      {
        selector: '#ac,#ca',
        style: {
          label: 'bezier',
          'curve-style': 'bezier',
        },
      },
      {
        selector: '#ad,#da',
        style: {
          label: 'segments',
          'curve-style': 'segments',
        },
      },
      {
        selector: '#ae,#ea',
        style: {
          label: 'straight',
          'curve-style': 'straight',
        },
      },
      {
        selector: '#af,#fa',
        style: {
          label: 'taxi',
          'curve-style': 'taxi',
        },
      },
      {
        selector: '#ag,#ga',
        style: {
          label: 'unbundled-bezier',
          'curve-style': 'unbundled-bezier',
        },
      },
    ],
  });
}
