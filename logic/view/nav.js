class Nav {
  constructor({ container }) {
    this.container = container;
  }

  display(stats) {
    let navContent = ``;

    // TOTAL
    navContent += `
      <div class="nav-itemgroup">
        <a href='#' class="nav-item">
          <div class="nav-itemcount">${stats.total}</div>
          <i title="all" class="nav-itemicon fas fa-asterisk"></i>
        </a>
      </div>`;

    // DONE
    if (SETTINGS.SHOWDONE) {
      navContent += `
        <div class="nav-itemgroup">
          <a href='#done-true' class="nav-item">
            <div class="nav-itemcount">${stats.done}</div>
            <i title="done" class="nav-itemicon ${Icons["true"]}"></i>
          </a>
          <a href='#done-false' class="nav-item">
            <div class="nav-itemcount">${stats.total - stats.done}</div>
            <i title="to do" class="nav-itemicon ${Icons["false"]}"></i>
          </a>
        </div>`;
    }

    // TYPES
    const types = stats.getSortedTypes(SETTINGS.STATSNUMTYPE);

    navContent += `<div class="nav-itemgroup">`;
    navContent += types
      .map(
        (type) =>
          `<a href='#type-${type.name}' class="nav-item">
            <div class="nav-itemcount">${type.count}</div>
            <i title="${type.name}"
               class="nav-itemicon ${Icons[type.name]}"></i>
          </a>`
      )
      .join("");
    navContent += `</div>`;

    // TERM
    navContent += `<div class="nav-itemgroup">`;
    if (stats.terms > 0) {
      navContent += `
        <a href='#term' class="nav-item">
          <div class="nav-itemcount">${stats.terms}</div>
          <i title="terms" class="nav-itemicon fas fa-ribbon"></i>
        </a>`;
    }
    navContent += `</div>`;

    // TAGS
    const tags = stats.getSortedTags(SETTINGS.STATSNUMTAGS);

    navContent += `<div class="nav-itemgroup">`;
    if (tags) {
      navContent += `<div class="nav-tagcontainer">`;
      navContent += `<i title="tags" class="nav-tagicon fas fa-tag"></i>`;
      navContent += tags
        .map(
          (tag) =>
            `<a class="nav-tag" href='#tag-${tag.name}'>
              <div class="nav-tagcount">${tag.count}</div>
              <div class="nav-taglabel">${tag.name}</div>
            </a>`
        )
        .join("");
      navContent += `</div>`;
    }
    navContent += `</div>`;

    this.container.innerHTML = navContent;
  }
}
