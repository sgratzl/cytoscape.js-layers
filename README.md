# Cytoscape.js Layers Plugin

[![License: MIT][mit-image]][mit-url] [![NPM Package][npm-image]][npm-url] [![Github Actions][github-actions-image]][github-actions-url] [![Cytoscape Plugin][cytoscape-image]][cytoscape-url]

A [Cytoscape.js](https://js.cytoscape.org) plugin for easy rendering of different layers in SVG, HTML, or Canvas format.

## Install

```sh
npm install cytoscape cytoscape-layers
```

## Usage

see [Samples](./samples) on Github

or at this [![Open in CodePen][codepen]](https://codepen.io/sgratzl/pen/XWXPMdM)

```js
import cytoscape from 'cytoscape';
import Layers from 'cytoscape-layers';
cytoscape.use(Layers);

const cy = cytoscape({
  container: document.getElementById('app'),
  elements: [
    { data: { id: 'a' } },
    { data: { id: 'b' } },
    {
      data: {
        id: 'ab',
        source: 'a',
        target: 'b',
      },
    },
  ],
});
const layers = cy.layers();
layers.nodeLayer.insertAfter('html-static').node.innerHTML = 'Static Test Label';

layers.renderPerNode(layers.append('canvas'), (ctx, node, bb) => {
  ctx.strokeStyle = 'red';
  ctx.strokeRect(0, 0, bb.w, bb.h);
});
layers.renderPerNode(layers.append('html'), (elem, node) => {
  elem.textContent = node.id();
});
layers.renderPerEdge(layers.append('canvas'), (ctx, edge, path) => {
  ctx.strokeStyle = 'red';
  ctx.stroke(path);
});
```

## Usage Examples

### Annotation

render a bar and a histogram below each node

Code: [annotation](./samples/annotations.ts)

![image](https://user-images.githubusercontent.com/4129778/87443573-f79ad400-c5f5-11ea-91c7-db327e6278ff.png)

### Edge Animations

using a animated linear gradient to animate edges in a separate layer

Code: [animatedEdges](./samples/animatedEdges.ts)

![animated edges](https://user-images.githubusercontent.com/4129778/87443931-70019500-c5f6-11ea-8671-ff6e2a829fa3.gif)

### Circular Context Menu

similar to Cytoscape Cxtmenu extension.

Code: [ctxmenu](./samples/ctxmenu.ts)

![image](https://user-images.githubusercontent.com/4129778/87440945-d4baf080-c5f2-11ea-96de-6a062132ea81.png)

### HTML Label

similar to Cytoscape HTML Node Label extension

Code: [node-html-label](./samples/node-html-label.ts)

![image](https://user-images.githubusercontent.com/4129778/87441059-f2885580-c5f2-11ea-9f6e-6af9e66c8831.png)

## Development Environment

```sh
npm i -g yarn
yarn set version latest
cat .yarnrc_patch.yml >> .yarnrc.yml
yarn
yarn pnpify --sdk vscode
```

### Common commands

```sh
yarn compile
yarn test
yarn lint
yarn fix
yarn build
yarn docs
yarn release
yarn release:pre
```

[mit-image]: https://img.shields.io/badge/License-MIT-yellow.svg
[mit-url]: https://opensource.org/licenses/MIT
[npm-image]: https://badge.fury.io/js/cytoscape-layers.svg
[npm-url]: https://npmjs.org/package/cytoscape-layers
[github-actions-image]: https://github.com/sgratzl/cytoscape.js-layers/workflows/ci/badge.svg
[github-actions-url]: https://github.com/sgratzl/cytoscape.js-layers/actions
[cytoscape-image]: https://img.shields.io/badge/Cytoscape-plugin-yellow
[cytoscape-url]: https://js.cytoscape.org/#extensions/ui-extensions
[codepen]: https://img.shields.io/badge/CodePen-open-blue?logo=codepen
