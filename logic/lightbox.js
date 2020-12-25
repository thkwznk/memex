class Lightbox {
  constructor({ container, classNamePrefix }) {
    this.container = container;

    let back = document.createElement("div");
    back.className = `${classNamePrefix}-back`;
    this.addEvent(back, "click", () => this.close());
    this.container.appendChild(back);

    this.img = document.createElement("img");
    this.img.className = `${classNamePrefix}-img`;
    this.addEvent(this.img, "click", () => this.close());

    this.container.appendChild(this.img);
  }

  load(imageSrc) {
    this.img.src = imageSrc;
    this.container.style.display = "block";
  }

  close() {
    this.container.style.display = "none";
  }

  addEvent(element, eventName, func) {
    if (element.attachEvent) {
      return element.attachEvent("on" + eventName, func);
    }

    return element.addEventListener(eventName, func, false);
  }
}
