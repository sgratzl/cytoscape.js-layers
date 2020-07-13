export const layerStyle: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  left: '0',
  top: '0',
  userSelect: 'none',
  outlineStyle: 'none',
  width: '100%',
  height: '100%',
};

function stop(e: Event) {
  e.stopPropagation();
}

export function stopClicks(node: SVGElement | HTMLElement) {
  node.addEventListener('click', stop);
  node.addEventListener('mousedown', stop);
  node.addEventListener('mouseup', stop);
  node.addEventListener('mousemove', stop);
}
