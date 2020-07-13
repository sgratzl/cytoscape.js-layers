import cy from 'cytoscape';

export function matchNodes<T extends HTMLElement | SVGElement>(root: T, nodes: cy.NodeCollection, factory: () => T) {
  // match
  const arr = Array.from(root.children) as T[];
  const map = new Map(arr.map((d) => [d.dataset.id!, d] as [string, T]));
  nodes.forEach((node, i) => {
    const id = node.id();
    const expected = arr[i];
    const has = map.get(id);
    let n: T;
    if (has) {
      map.delete(id);
      if (expected === has) {
        // match 1:1
        return;
      }
      n = has;
    } else {
      // need a new one
      n = factory();
      n.dataset.id = id;
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
