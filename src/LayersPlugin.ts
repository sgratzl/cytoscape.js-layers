import cy from 'cytoscape';

export interface ILayersPluginOptions extends ILayersPathOptions {
  zIndex?: number;
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export default class BubbleSetsPlugin {
  readonly svg: SVGSVGElement;
  readonly #layers: BubbleSetPath[] = [];
  readonly #adapter = {
    remove: (path: BubbleSetPath) => {
      const index = this.#layers.indexOf(path);
      if (index < 0) {
        return false;
      }
      this.#layers.splice(index, 1);
      return true;
    },
  };
  readonly #cy: cy.Core;
  readonly #options: IBubbleSetsPluginOptions;

  constructor(cy: cy.Core, options: IBubbleSetsPluginOptions = {}) {
    this.#cy = cy;
    this.#options = options;
    const container = cy.container();

    const svg = (this.svg = (container?.ownerDocument ?? document).createElementNS(SVG_NAMESPACE, 'svg'));
    if (container) {
      container.insertAdjacentElement('afterbegin', svg);
    }
    svg.style.zIndex = (options.zIndex ?? 0).toString();
    svg.style.position = 'absolute';
    svg.style.left = '0';
    svg.style.top = '0';
    svg.style.userSelect = 'none';
    svg.style.outlineStyle = 'none';

    svg.appendChild(svg.ownerDocument.createElementNS(SVG_NAMESPACE, 'g'));
    cy.on('viewport', this.zoomed);
    cy.on('resize', this.resize);
    this.resize();
  }

  private readonly resize = () => {
    this.svg.style.width = `${this.#cy.width()}px`;
    this.svg.style.height = `${this.#cy.height()}px`;
  };

  destroy() {
    for (const path of this.#layers) {
      path.remove();
    }
    this.#cy.off('viewport', undefined, this.zoomed);
    this.#cy.off('resize', undefined, this.resize);
    this.svg.remove();
  }

  addPath(
    nodes: cy.NodeCollection,
    edges: cy.EdgeCollection | null = this.#cy.collection(),
    avoidNodes: cy.NodeCollection | null = this.#cy.collection(),
    options: IBubbleSetPathOptions = {}
  ) {
    const node = this.svg.ownerDocument.createElementNS(SVG_NAMESPACE, 'path');
    this.svg.firstElementChild!.appendChild(node);
    const path = new BubbleSetPath(
      this.#adapter,
      node,
      nodes,
      edges ?? this.#cy.collection(),
      avoidNodes ?? this.#cy.collection(),
      Object.assign({}, this.#options, options)
    );
    this.#layers.push(path);
    if (this.#layers.length === 1) {
      this.zoomed();
    }
    path.update();
    return path;
  }

  getPaths() {
    return this.#layers.slice();
  }

  removePath(path: Layers) {
    const i = this.#layers.indexOf(path);
    if (i < 0) {
      return false;
    }
    return path.remove();
  }

  private readonly zoomed = () => {
    const pan = this.#cy.pan();
    const zoom = this.#cy.zoom();
    const g = this.svg.firstElementChild! as SVGGElement;
    g.setAttribute('transform', `translate(${pan.x},${pan.y})scale(${zoom})`);
  };

  update() {
    this.zoomed();
    this.#layers.forEach((p) => p.update());
  }
}

export function layers(this: cy.Core, options: ILayersPluginOptions = {}) {
  return new LayersPlugin(this, options);
}
