/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace CXTMenu {
  declare const cytoscape: typeof import('cytoscape');
  declare const CytoscapeLayers: typeof import('../build');

  export const cy = cytoscape({
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

  const layers = CytoscapeLayers.layers(cy);

  const menuLayer = layers.append('svg-static', {
    stopClicks: true,
  });
  menuLayer.node.classList.add('menuItems');

  const menuItems = ['A', 'B', 'C'];
  for (const item of menuItems) {
    menuLayer.node.insertAdjacentHTML(
      'beforeend',
      `<g class="menuItem">
    <path></path>
    <text>${item}</text>
    <title>${item}</title>
    </g>`
    );
    const g = menuLayer.node.lastElementChild! as SVGElement;
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.log('clicked', item);
    });
  }

  const wedgeAngle = 360 / menuItems.length;
  const DEG2RAD = Math.PI / 180;
  const r = Math.round;

  function generateArc(i: number, innerRadius: number, outerRadius: number) {
    const a0 = DEG2RAD * (wedgeAngle * i - 90);
    const a1 = a0 + DEG2RAD * wedgeAngle;
    const xa0 = Math.cos(a0);
    const ya0 = Math.sin(a0);
    const xa1 = Math.cos(a1);
    const ya1 = Math.sin(a1);
    return `M ${r(xa0 * outerRadius)} ${r(ya0 * outerRadius)}
    A ${r(outerRadius)} ${r(outerRadius)} 0 0 1 ${r(xa1 * outerRadius)} ${r(ya1 * outerRadius)}
    L ${r(xa1 * innerRadius)} ${r(ya1 * innerRadius)}
    A ${r(innerRadius)} ${r(innerRadius)} 0 0 0 ${r(xa0 * innerRadius)} ${r(ya0 * innerRadius)}
    Z
    `;
  }

  let currentSelection: cytoscape.NodeSingular | null = null;

  function updateMenu(e: { target: any }) {
    const node = e.target as cytoscape.NodeSingular;
    const pos = node.renderedPosition();
    menuLayer.node.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

    const innerRadius = Math.max(node.renderedWidth(), node.renderedHeight()) / 2;
    const outerRadius = innerRadius + 50;
    const labelRadius = innerRadius + 25;

    // update menu positions and arcs
    Array.from(menuLayer.node.children).forEach((g, i) => {
      const path = g.querySelector('path')!;
      const labelAngle = DEG2RAD * (-90 + i * wedgeAngle + wedgeAngle / 2);

      path.setAttribute('d', generateArc(i, innerRadius, outerRadius));
      const text = g.querySelector('text')!;
      text.setAttribute('x', r(Math.cos(labelAngle) * labelRadius).toString());
      text.setAttribute('y', r(Math.sin(labelAngle) * labelRadius).toString());
    });
  }

  menuLayer.node.style.opacity = '0';

  cy.on('viewport', () => {
    if (currentSelection) {
      updateMenu({ target: currentSelection });
    }
  });

  cy.on('select', 'node', (e) => {
    const node = e.target as cytoscape.NodeSingular;
    if (currentSelection) {
      currentSelection.off('position', undefined, updateMenu);
    }
    currentSelection = node;
    updateMenu(e);
    currentSelection.on('position', updateMenu);
    menuLayer.node.style.opacity = '1';
  });
  cy.on('unselect', 'node', () => {
    if (currentSelection) {
      currentSelection.off('position', undefined, updateMenu);
    }
    currentSelection = null;
    menuLayer.node.style.opacity = '0';
  });
}
