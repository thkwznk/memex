function Grid() {
  this.container = null;
  this.overlay = null;

  this.msnry = null;
  var parent = this;

  this.install = function (container, overlay, elemContainer, elemItem) {
    this.container = container;
    this.overlay = overlay;

    if (SETTINGS.USEMASONRY) {
      this.msnry = new Masonry(elemContainer, {
        itemSelector: elemItem,
        columnWidth: 350,
        gutter: 20,
        fitWidth: true,
        transitionDuration: 0,
      });
    }
  };

  this.clear = function () {
    this.container.innerHTML = "";
  };

  this.display = function (html) {
    this.container.innerHTML = html;
    seer.note("render html");

    // LAYOUT
    if (SETTINGS.USEMASONRY) {
      this.msnry.reloadItems();
      this.msnry.layout();

      if (SETTINGS.MASONRYCOMPLETE || SETTINGS.MASONRYPROGRESS) {
        let imgLoad = imagesLoaded(this.container);
        if (!SETTINGS.MASONRYPROGRESS) {
          // When all images finish: redo mansonry layout
          imgLoad.on("always", function () {
            parent.msnry.layout();
          });
        } else {
          // As images load one by one: redo masonry layout
          imgLoad.on("progress", function () {
            parent.msnry.layout();
          });
        }
      }
      seer.note("masonry layout");
    }
  };

  this.buildAllArticles = function (db) {
    let articles = new Array();

    for (const key in db) {
      articles.push(this.buildArticle(db[key], key));
    }

    return articles.join("");
  };

  this.buildArticle = function (value, key) {
    let itemClass = "article";

    if (SETTINGS.WIDEARTICLE) {
      let isWideQuote =
        value.QOTE &&
        Array.isArray(value.QOTE) &&
        value.QOTE.length > SETTINGS.AUTOWIDETRIGGER;

      if (value.WIDE || isWideQuote) {
        itemClass += " article-wide";
      }
    }

    let isImageType =
      SETTINGS.SHOWIMAG && main.util.isType(value.TYPE, "image");

    let onclickImage = isImageType
      ? `onclick="main.grid.handleImageClick(event, this, '${value.FILE}');"`
      : "";

    // ARTICLE
    let article = `<article class="${itemClass}" id="${
      SETTINGS.ARTICLEIDBASE + value.DIID
    }">`;

    if (value.LINK) {
      let isUrlSeen = value.SEEN && value.SEEN === "true";
      var idUrl = isUrlSeen ? "urlseen" : "url";

      // LINK START
      if (SETTINGS.SHOWLINK && !main.util.isObject(value.LINK)) {
        // If this item has only one link then make the whole title the link
        article += `<a class="article-link" href="${String(
          value.LINK
        )}" id="${idUrl}">`;
      }
    }

    // UPPER CONTENT START
    if (SETTINGS.SHOWUPPER) {
      let upperClass = isImageType
        ? "article-containerupper-image"
        : "article-containerupper";

      article += `<div class="${upperClass}" ${onclickImage}>`;

      // TITLE
      if (SETTINGS.SHOWTITLE) {
        article += `<header class="article-title">${key.to_properCase()}</header>`;
      }

      // LINK END
      if (SETTINGS.SHOWLINK && value.LINK) {
        if (main.util.isObject(value.LINK)) {
          for (let l = 0; l < value.LINK.length; l++) {
            article += `<a class="article-link" href="${String(
              value.LINK[l]
            )}" id="${idUrl}">`;
            article += `<div class="article-linkcontainer"><div class="article-linkicon">${main.util.buildIcon(
              "link"
            )}</div><div class="article-linktitle">${main.util.extractRootDomain(
              value.LINK[l]
            )}</div></div></a>`;
          }
        } else {
          article += `<div class="article-linkcontainer"><div class="article-linkicon">${main.util.buildIcon(
            "link"
          )}</div><div class="article-linktitle">${main.util.extractRootDomain(
            value.LINK
          )}</div></div></a>`;
        }
      }

      // TYPE
      if (SETTINGS.SHOWTYPE || SETTINGS.SHOWDONE) {
        article += `<div class="article-typecontainer">`;

        if (SETTINGS.SHOWTYPE && value.TYPE) {
          for (let tc = 0; tc < value.TYPE.length; tc++) {
            article += `<a class="article-type" href='#type-${value.TYPE[tc]}'>`;
            article += main.util.buildIcon(
              value.TYPE[tc],
              value.TYPE[tc],
              "article-typeicon"
            );
            article += `</a>`;
          }
        }

        if (SETTINGS.SHOWDONE) {
          let done = value.DONE || "false";
          article += `<a class="article-type" href='#done-${done}'>`;
          article += main.util.buildIcon(done, done, "article-typeicon");
          article += `</a>`;
        }

        article += `</div>`;
      }

      // UPPER CONTENT END
      article += `</div>`;
    }

    // IMAGE - for image-type-article
    if (isImageType && value.FILE && main.util.isImage(value.FILE)) {
      // IMAGE ARTICLE

      article += `<div class="article-imageType-imgContainer">`;
      if (SETTINGS.SHOWOVERLAY) {
        article += `<div class="image-overlay" ${onclickImage}></div>`;
      }
      article += `<img class="article-image-img" src="content/media/${value.FILE}">`;

      article += this.doLower(value, isImageType, onclickImage);

      article += `</div>`;

      article += `<div class="article-containerbelow">`;
      // TERM
      if (SETTINGS.SHOWTERM && value.TERM) {
        article += this.doRowMulti("term", value.TERM);
      }

      // NOTE
      if (SETTINGS.SHOWNOTE && value.NOTE) {
        article += this.doRowMulti("note", value.NOTE);
      }

      // QUOTE
      if (SETTINGS.SHOWQOTE && value.QOTE) {
        article += this.doRowMulti("quote", value.QOTE);
      }

      // PROGRESS
      if (SETTINGS.SHOWPROG && value.PROG) {
        article += this.doRowMulti("progress", value.PROG);
      }
      article += `</div>`;
    } else {
      // NORMAL ARTICLE (NON-IMAGE)
      article += this.doLower(value, isImageType, onclickImage);
    }

    article += `</article>`;
    return article;
  };

  this.doLower = function (value, articleIsImageType, onclickImage) {
    let article = "";
    // LOWER CONTENT START
    if (SETTINGS.SHOWLOWER) {
      let lowerClass = "article-containerlower";
      if (articleIsImageType) {
        lowerClass = "article-containerlower-image";
      }
      article += `<div class="${lowerClass}" ${onclickImage}>`;

      // TIME
      if (SETTINGS.SHOWDATE && value.DATE) {
        article += this.doRow("date", value.DATE);
      }

      // AUTHOR
      if (SETTINGS.SHOWAUTH && value.AUTH) {
        for (var i = 0; i < value.AUTH.length; i++) {
          article += this.doRow("author", value.AUTH[i].to_properCase());
        }
      }

      // TAGS
      if (SETTINGS.SHOWTAGS && value.TAGS) {
        article += this.doRowArray("tags", value.TAGS, "tag", false);
      }

      // PROJECT
      if (SETTINGS.SHOWPROJ && value.PROJ) {
        article += this.doRowArray("project", value.PROJ, "proj", true);
      }

      if (!articleIsImageType) {
        // TERM
        if (SETTINGS.SHOWTERM && value.TERM) {
          article += this.doRowMulti("term", value.TERM);
        }

        // NOTE
        if (SETTINGS.SHOWNOTE && value.NOTE) {
          article += this.doRowMulti("note", value.NOTE);
        }

        // QUOTE
        if (SETTINGS.SHOWQOTE && value.QOTE) {
          article += this.doRowMulti("quote", value.QOTE);
        }

        // PROGRESS
        if (SETTINGS.SHOWPROG && value.PROG) {
          article += this.doRowMulti("progress", value.PROG);
        }
      }

      // IMAGE - for non-image-type-article
      if (
        SETTINGS.SHOWIMAG &&
        !main.util.isType(value.TYPE, "image") &&
        value.FILE &&
        main.util.isImage(value.FILE)
      ) {
        article += `<div class="image">`;
        article += `<img class="article-img" src="content/media/${value.FILE}" onclick="lightbox.load('content/media/${value.FILE}')">`;
        article += `</div>`;
      }

      // FILE
      if (SETTINGS.SHOWFILE && value.FILE) {
        if (main.util.isObject(value.FILE)) {
          for (var i = 0; i < value.FILE.length; i++) {
            article += this.doRow(
              "file",
              `<a class="article-file-link" href="content/media/${value.FILE[i]}">${value.FILE[i]}</a>`,
              "article-file"
            );
          }
        } else {
          // single
          article += this.doRow(
            "file",
            `<a class="article-file-link" href="content/media/${value.FILE}">${value.FILE}</a>`,
            "article-file"
          );
        }
      }

      // LOWER CONTENT END
      article += `</div>`;
    }
    return article;
  };

  this.doRow = function (type, content, extraClass) {
    return `<div class="article-row${
      extraClass != undefined ? " " + extraClass : ""
    }">
      ${type != undefined ? main.util.buildIcon(type) : ""}
      <div class="article-rowtext">${content}</div>
      </div>`;
  };

  this.doRowArray = function (type, data, query, propercase) {
    let content = "";
    for (var i = 0; i < data.length; i++) {
      content += `<a class="article-taglink" href="#${query}-${data[i]}">${
        propercase == true ? data[i].to_properCase() : data[i]
      }</a>`;
      if (i + 1 !== data.length) {
        content += `, `;
      }
    }
    return this.doRow(type, content);
  };

  this.doRowMulti = function (type, data) {
    let result = "";
    if (Array.isArray(data)) {
      for (var i in data) {
        if (data[i].substring(0, 2) == "> ") {
          // New item
          if (data[i].includes(": ")) {
            let titleSplit = data[i].substring(2).split(": "); // .substring(2) removes the "> "
            for (var e = 0; e < titleSplit.length; e++) {
              titleSplit[e] = titleSplit[e].trim();
            }
            result += this.doRow(
              type,
              `<b>${titleSplit[0]}</b>: ${titleSplit[1]}`
            );
          } else {
            result += this.doRow(type, data[i].substring(2));
          }
        } else if (data[i].substring(0, 2) === "& ") {
          // New line in current item
          result += this.doRow(null, data[i].substring(2));
        } else if (data[i].substring(0, 2) == "- ") {
          // Bullet point
          result += this.doRow("dash", data[i].substring(2));
        } else {
          // Handle unformatted
          result += this.doRow(type, data[i]);
        }
      }
    } else {
      // Handle not array
      result += this.doRow(type, data);
    }
    return result;
  };

  this.handleImageClick = function (e, element, file) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    if (target == element) {
      // If user is clicking given element, or element's background...
      // as opposed to an element's child content, then do lightbox.
      // This stops lightbox from happening when clicking on tags, file etc
      lightbox.load(`content/media/${file}`);
    }
  };
}
