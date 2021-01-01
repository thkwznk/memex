function createElement(elementTag, options = {}, ...children) {
  const element = document.createElement(elementTag);

  for (let option in options) {
    if (options[option] === undefined) continue;

    if (element[option] !== undefined) element[option] = options[option];
    else element.setAttribute(option, options[option]);
  }

  for (let child of children.flat(2)) {
    if (!child) continue;

    element.appendChild(
      typeof child === "string" || typeof child === "number"
        ? createElement("span", { innerText: child })
        : child
    );
  }

  return element;
}

const Anchor = (options, ...children) =>
  createElement("a", options, ...children);

const Container = (options, ...children) =>
  createElement("div", options, ...children);
