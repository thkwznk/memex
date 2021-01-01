// requires ./components.js

const Icon = ({ type, className = "article-icon" }) =>
  createElement("i", {
    title: type,
    className: [Icons[type], "textIcon", className].join(" "),
  });

const Row = ({ className = "", type }, ...children) =>
  Container(
    { className: `article-row ${className}` },
    type && Icon({ type }),
    createElement("div", { className: "article-rowtext" }, ...children)
  );

const RowArray = ({ type, values, query, properCase }) => {
  values = values
    .map((value) => [
      Anchor(
        {
          className: "article-taglink",
          href: `#${query}-${value}`,
        },
        properCase ? Util.toProperCase(value) : value
      ),
      ", ",
    ])
    .flat();

  values.pop(); // Remove the last comma

  return Row({ type }, values);
};

const MultilineRow = ({ type, values }) =>
  Array.isArray(values)
    ? values.map((value) => MultilineRowLine(type, value))
    : Row({ type }, values);

function MultilineRowLine(type, value) {
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

class Grid {
  constructor({ container, numberOfColumns = 3 }) {
    this.container = container;
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

    let columnSkip = new Array(this.columns.length);

    for (let i = 0; i < columnSkip.length; i++) {
      columnSkip[i] = 0;
    }

    for (let i = 0; i < articles.length; i++) {
      let columnIndex = i % this.columns.length;

      if (columnSkip[columnIndex]) {
        columnSkip[columnIndex]--;
        continue;
      }

      this.columns[columnIndex].appendChild(articles[i]);

      let height = articles[i].getAttribute("height");

      if (height) columnSkip[columnIndex] += height;
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
        height: value.HEIGHT,
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

    const ArticleLink = (options, ...children) =>
      Anchor(
        {
          ...options,
          className: "article-link",
        },
        ...children
      );

    const IconLink = ({ type, ...options }) =>
      Anchor(
        { ...options, className: "article-type" },
        Icon({ type, className: "article-typeicon" })
      );

    const Header = () =>
      Container(
        {
          className,
          onclick,
        },
        SETTINGS.SHOWTITLE &&
          createElement(
            "header",
            {
              className: "article-title",
            },
            Util.toProperCase(key)
          ),
        SETTINGS.SHOWLINK &&
          value.LINK &&
          links.map((link) =>
            ArticleLink(
              {
                href: String(link),
              },
              Container(
                { className: "article-linkcontainer" },
                Container(
                  { className: "article-linkicon" },
                  Icon({ type: "link" })
                ),
                Container(
                  {
                    className: "article-linktitle",
                  },
                  new URL(link).hostname
                )
              )
            )
          ),
        (SETTINGS.SHOWTYPE || SETTINGS.SHOWDONE) &&
          Container(
            { className: "article-typecontainer" },
            SETTINGS.SHOWTYPE &&
              value.TYPE &&
              value.TYPE.map((type) =>
                IconLink({ type, href: `#type-${type}` })
              ),
            SETTINGS.SHOWDONE && IconLink({ type: done, href: `#done-${done}` })
          )
      );

    // If this item has only one link then make the whole title the link
    return hasSingleLink
      ? ArticleLink(
          {
            href: String(value.LINK),
          },
          Header()
        )
      : Header();
  }

  doLower(value, isImageType) {
    if (!SETTINGS.SHOWLOWER) return null;

    let files = Array.isArray(value.FILE) ? value.FILE : [value.FILE];

    const showDate = SETTINGS.SHOWDATE && value.DATE;
    const showAuthor = SETTINGS.SHOWAUTH && value.AUTH;
    const showTags = SETTINGS.SHOWTAGS && value.TAGS;
    const showProjects = SETTINGS.SHOWPROJ && value.PROJ;
    const showImage = // IMAGE - for non-image-type-article
      SETTINGS.SHOWIMAG &&
      !Util.isType(value.TYPE, "image") &&
      value.FILE &&
      Util.isImage(value.FILE);
    const showFile = SETTINGS.SHOWFILE && value.FILE;

    return Container(
      isImageType
        ? {
            className: "article-containerlower-image",
            onclick: this.handleOnClick(value.FILE),
          }
        : { className: "article-containerlower" },
      showDate && Row({ type: "date" }, value.DATE),
      showAuthor &&
        value.AUTH.map((author) =>
          Row({ type: "author" }, Util.toProperCase(author))
        ),
      showTags &&
        RowArray({
          type: "tags",
          values: value.TAGS,
          query: "tag",
          properCase: false,
        }),
      showProjects &&
        RowArray({
          type: "project",
          values: value.PROJ,
          query: "proj",
          properCase: true,
        }),
      !isImageType && this.doBelow(value),
      showImage &&
        Container(
          { className: "image" },
          createElement("img", {
            className: "article-img",
            src: `content/media/${value.FILE}`,
            onclick: this.handleOnClick(value.FILE),
          })
        ),
      showFile &&
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
      SETTINGS.SHOWTERM &&
        value.TERM &&
        MultilineRow({ type: "term", values: value.TERM }),
      SETTINGS.SHOWNOTE &&
        value.NOTE &&
        MultilineRow({ type: "note", values: value.NOTE }),
      SETTINGS.SHOWQOTE &&
        value.QOTE &&
        MultilineRow({ type: "quote", values: value.QOTE }),
      SETTINGS.SHOWPROG &&
        value.PROG &&
        MultilineRow({ type: "progress", values: value.PROG }),
    ];
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
