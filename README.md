# Cytoscape.js Layers Plugin

[![NPM Package][npm-image]][npm-url] [![Github Actions][github-actions-image]][github-actions-url] [![Cytoscape Plugin][cytoscape-image]][cytoscape-url]

A [Cytoscape.js](https://js.cytoscape.org) plugin for rendering TODO

## Install

```sh
npm install cytoscape cytoscape-layers
```

## Usage

see [Samples](https://github.com/sgratzl/cytoscape-layers/tree/master/samples) on Github

or at this [![Open in CodePen][codepen]](https://codepen.io/sgratzl/pen/TODO)

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
cy.ready(() => {
  // TODO
});
```

## API

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

[npm-image]: https://badge.fury.io/js/cytoscape-layers.svg
[npm-url]: https://npmjs.org/package/cytoscape-layers
[github-actions-image]: https://github.com/sgratzl/cytoscape.js-layers/workflows/ci/badge.svg
[github-actions-url]: https://github.com/sgratzl/cytoscape.js-layers/actions
[cytoscape-image]: https://img.shields.io/badge/Cytoscape-plugin-yellow
[cytoscape-url]: https://js.cytoscape.org/#extensions/ui-extensions
[codepen]: https://img.shields.io/badge/CodePen-open-blue?logo=codepen
