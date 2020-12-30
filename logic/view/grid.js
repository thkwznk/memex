function createElement(elementTag, options = {}, ...children) {
  const element = document.createElement(elementTag);

  for (let option in options) {
    if (element[option] !== undefined) element[option] = options[option];
    else element.setAttribute(option, options[option]);
  }

  for (let child of children.flat(2)) {
    if (!child) continue;

    element.appendChild(
      typeof child === "string"
        ? createElement("span", { innerText: child })
        : child
    );
  }

  return element;
}

const Icon = (type, label, altClass) =>
  createElement("i", {
    title: label || type || undefined,
    className: [Icons[type], "textIcon", altClass || "article-icon"].join(" "),
  });

const Row = ({ className, type }, ...children) =>
  createElement(
    "div",
    { className: `article-row ${className}` },
    type && Icon(type),
    createElement("div", { className: "article-rowtext" }, ...children)
  );

const Anchor = (options, ...children) =>
  createElement("a", options, ...children);

const Container = (options, ...children) =>
  createElement("div", options, ...children);

class Grid {
  constructor({ container, overlay, numberOfColumns = 3 }) {
    this.container = container;
    this.overlay = overlay;
    this.columns = [];

    for (let i = 0; i < numberOfColumns; i++) {
      let column = createElement("div", { className: "column" });
      this.container.appendChild(column);
      this.columns.push(column);
    }
  }

  clear() {
    for (let column of this.columns) column.innerHTML = "";
  }

  display(articles) {
    this.clear();

    for (let i = 0; i < articles.length; i++) {
      this.columns[i % this.columns.length].appendChild(articles[i]);
    }

    seer.note("render html");
  }

  buildAllArticles(db) {
    return Object.keys(db).map((dbKey) => this.buildArticle(dbKey, db[dbKey]));
  }

  buildArticle(key, value) {
    let isImageType =
      SETTINGS.SHOWIMAG &&
      Util.isType(value.TYPE, "image") &&
      value.FILE &&
      Util.isImage(value.FILE);

    return createElement(
      "article",
      {
        className: "article",
        id: SETTINGS.ARTICLEIDBASE + value.DIID,
      },
      SETTINGS.SHOWUPPER &&
        this.doUpper({
          className: isImageType
            ? "article-containerupper-image"
            : "article-containerupper",
          onclick: isImageType && this.handleOnClick(value.FILE),
          value,
          key,
        }),
      isImageType
        ? this.doImageArticle(value)
        : this.doLower(value, isImageType)
    );
  }

  doImageArticle(value) {
    return [
      Container(
        {
          className: "article-imageType-imgContainer",
        },
        SETTINGS.SHOWOVERLAY &&
          Container({
            className: "image-overlay",
            onclick: this.handleOnClick(value.FILE),
          }),
        createElement("img", {
          className: "article-image-img",
          src: `content/media/${value.FILE}`,
        }),
        this.doLower(value, true)
      ),
      Container({ className: "article-containerbelow" }, this.doBelow(value)),
    ];
  }

  doUpper({ className, onclick, value, key }) {
    let hasSingleLink =
      SETTINGS.SHOWLINK && value.LINK && typeof value.LINK !== "object";
    let links = Array.isArray(value.LINK) ? value.LINK : [value.LINK];
    let done = value.DONE || "false";
    let idUrl = value.SEEN && value.SEEN === "true" ? "urlseen" : "url";

    const Header = () =>
      Container(
        {
          className,
          onclick,
        },
        SETTINGS.SHOWTITLE &&
          createElement("header", {
            className: "article-title",
            innerText: Util.toProperCase(key),
          }),
        SETTINGS.SHOWLINK &&
          value.LINK &&
          links.map((link) =>
            Anchor(
              {
                className: "article-link",
                href: String(link),
                id: idUrl,
              },
              Container(
                { className: "article-linkcontainer" },
                Container({ className: "article-linkicon" }, Icon("link")),
                Container({
                  className: "article-linktitle",
                  innerText: new URL(link).hostname,
                })
              )
            )
          ),
        (SETTINGS.SHOWTYPE || SETTINGS.SHOWDONE) &&
          Container(
            { className: "article-typecontainer" },
            SETTINGS.SHOWTYPE &&
              value.TYPE &&
              value.TYPE.map((type) =>
                Anchor(
                  { className: "article-type", href: `#type-${type}` },
                  Icon(type, type, "article-typeicon")
                )
              ),
            SETTINGS.SHOWDONE &&
              Anchor(
                { className: "article-type", href: `#done-${done}` },
                Icon(done, done, "article-typeicon")
              )
          )
      );

    // If this item has only one link then make the whole title the link
    return hasSingleLink
      ? Anchor(
          {
            className: "article-link",
            href: String(value.LINK),
            id: idUrl,
          },
          Header()
        )
      : Header();
  }

  doLower(value, isImageType) {
    if (!SETTINGS.SHOWLOWER) return null;

    let files = Array.isArray(value.FILE) ? value.FILE : [value.FILE];

    return Container(
      {
        className: isImageType
          ? "article-containerlower-image"
          : "article-containerlower",
        onclick: isImageType && this.handleOnClick(value.FILE),
      },
      SETTINGS.SHOWDATE && value.DATE && Row({ type: "date" }, value.DATE),
      SETTINGS.SHOWAUTH &&
        value.AUTH &&
        value.AUTH.map((author) =>
          Row({ type: "author" }, Util.toProperCase(author))
        ),
      SETTINGS.SHOWTAGS &&
        value.TAGS &&
        this.doRowArray("tags", value.TAGS, "tag", false),
      SETTINGS.SHOWPROJ &&
        value.PROJ &&
        this.doRowArray("project", value.PROJ, "proj", true),
      !isImageType && this.doBelow(value),
      // IMAGE - for non-image-type-article
      SETTINGS.SHOWIMAG &&
        !Util.isType(value.TYPE, "image") &&
        value.FILE &&
        Util.isImage(value.FILE) &&
        Container(
          { className: "image" },
          createElement("img", {
            className: "article-img",
            src: `content/media/${value.FILE}`,
            onclick: this.handleOnClick(value.FILE),
          })
        ),
      SETTINGS.SHOWFILE &&
        value.FILE &&
        files.map((file) =>
          Row(
            { type: "file", className: "article-file" },
            Anchor(
              {
                className: "article-file-link",
                href: `content/media/${file}`,
              },
              file
            )
          )
        )
    );
  }

  doBelow(value) {
    return [
      SETTINGS.SHOWTERM && value.TERM && this.doRowMulti("term", value.TERM),
      SETTINGS.SHOWNOTE && value.NOTE && this.doRowMulti("note", value.NOTE),
      SETTINGS.SHOWQOTE && value.QOTE && this.doRowMulti("quote", value.QOTE),
      SETTINGS.SHOWPROG &&
        value.PROG &&
        this.doRowMulti("progress", value.PROG),
    ];
  }

  doRowArray(type, data, query, propercase) {
    let values = data
      .map((value) => [
        Anchor({
          className: "article-taglink",
          href: `#${query}-${value}`,
          innerText: propercase ? Util.toProperCase(value) : value,
        }),
        ", ",
      ])
      .flat();

    values.pop(); // Remove the last comma

    return Row({ type }, values);
  }

  doRowMulti(type, data) {
    if (!Array.isArray(data)) return Row({ type }, data);

    return data.map((entry) => this.doRowMultiEntry(type, entry));
  }

  doRowMultiEntry(type, value) {
    let prefix = value.substring(0, 2);

    // New item
    if (prefix === "> ") {
      if (value.includes(": ")) {
        let titleSplit = value.substring(2).split(": "); // .substring(2) removes the "> "

        return Row(
          { type },
          createElement("b", {}, titleSplit[0].trim()),
          `: ${titleSplit[1].trim()}`
        );
      }

      return Row({ type }, value.substring(2));
    }

    // New line in current item
    if (prefix === "& ") return Row({ type: null }, value.substring(2));

    // Bullet point
    if (prefix === "- ") return Row({ type: "dash" }, value.substring(2));

    // Handle unformatted
    return Row({ type }, value);
  }

  handleOnClick(file) {
    return function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;

      // If user is clicking given element, or element's background...
      // as opposed to an element's child content, then do lightbox.
      // This stops lightbox from happening when clicking on tags, file etc
      if (target === this) lightbox.load(`content/media/${file}`);
    };
  }
}
