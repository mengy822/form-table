const map = new Map();
const map1 = new Map();
const resizeObserver = new ResizeObserver((entries) => {
  for (const entrie of entries) {
    const cb = map.get(entrie.target);
    cb && cb();
  }
});

export function addWindowResize(id: any, callback: any) {
  // document.querySelector(id).addEventListener("resize", callback);
  const element = id instanceof HTMLElement ? id : document.querySelector(id);
  map1.set(id, element);
  if (!element) return;
  resizeObserver.observe(element);
  map.set(element, callback);
}

export function removeWindowResize(id: any) {
  // document.querySelector(id).removeEventListener("resize", callback);
  const element = id instanceof HTMLElement ? id : document.querySelector(id) || map1.get(id);
  // if(element==null)
  // console.log(element == null, id);
  try {
    resizeObserver.unobserve(element);
  } catch (e) { }
  map.delete(element);
  map1.delete(id);
}
