import type cy from 'cytoscape';

export interface IMatchOptions<T extends HTMLElement | SVGElement> {
  bb: (node: cy.NodeSingular) => cy.BoundingBox12 & cy.BoundingBoxWH;
  isVisible: (bb: cy.BoundingBox12 & cy.BoundingBoxWH) => boolean;
  enter: (node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => T;
  update: (elem: T, node: cy.NodeSingular, bb: cy.BoundingBox12 & cy.BoundingBoxWH) => void;
  uniqueElements: boolean;
}

export function matchNodes<T extends HTMLElement | SVGElement>(
  root: T,
  nodes: cy.NodeCollection,
  options: IMatchOptions<T>
) {
  const arr = Array.from(root.children) as T[];
  if (!options.uniqueElements) {
    nodes.forEach((node) => {
      if (node.removed()) {
        return;
      }
      const bb = options.bb(node);
      if (!options.isVisible(bb)) {
        return;
      }
      if (arr.length > 0) {
        options.update(arr.shift()!, node, bb);
      } else {
        const elem = options.enter(node, bb);
        root.appendChild(elem);
        options.update(elem, node, bb);
      }
    });
    for (const rest of arr) {
      rest.remove();
    }
    return;
  }
  // match
  const map = new Map(arr.map((d) => [d.dataset.id!, d] as [string, T]));

  let i = -1;
  nodes.forEach((node) => {
    if (node.removed()) {
      return;
    }
    const bb = options.bb(node);
    if (!options.isVisible(bb)) {
      return;
    }
    i++;
    const id = node.id();
    const expected = arr[i];
    const has = map.get(id);
    let n: T;
    if (has) {
      options.update(has, node, bb);
      map.delete(id);
      if (expected === has) {
        // match 1:1
        return;
      }
      n = has;
    } else {
      // need a new one
      n = options.enter(node, bb);
      n.dataset.id = id;
      options.update(n, node, bb);
    }

    if (i === 0) {
      root.insertAdjacentElement('afterbegin', n);
    } else {
      arr[i - 1].insertAdjacentElement('afterend', n);
    }
    arr.splice(i, 0, n);
  });
  // delete rest
  map.forEach((n) => n.remove());
}

export interface ICallbackRemover {
  remove(): void;
}

export function registerCallback<U, T extends { callback(c: U): void; callbacks: U[] }>(
  layer: T,
  renderer: U
): ICallbackRemover {
  layer.callback(renderer);
  return {
    remove: () => {
      layer.callbacks.splice(layer.callbacks.indexOf(renderer), 1);
    },
  };
}
