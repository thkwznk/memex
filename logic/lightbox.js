// requires ./view/components.js

class Lightbox {
  constructor({ container, classNamePrefix }) {
    this.container = container;

    let back = Container({
      className: `${classNamePrefix}-back`,
      onclick: () => this.close(),
    });
    this.container.appendChild(back);

    this.img = createElement("img", {
      className: `${classNamePrefix}-img`,
      onclick: () => this.close(),
    });

    this.container.appendChild(this.img);
  }

  load(imageSrc) {
    this.img.src = imageSrc;
    this.container.style.display = "block";
  }

  close() {
    this.container.style.display = "none";
  }
}
