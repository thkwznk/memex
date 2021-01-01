// requires ./components.js

const NavGroup = (...items) =>
  Container(
    { className: "nav-itemgroup" },
    ...items.map((item) =>
      Anchor(
        { className: "nav-item", href: item.href },
        Container({ className: "nav-itemcount" }, item.count),
        createElement("i", {
          title: item.title,
          className: `nav-itemicon ${item.className}`,
        })
      )
    )
  );

class Nav {
  constructor({ container }) {
    this.container = container;
  }

  display(stats) {
    this.container.innerHTML = "";

    this.container.appendChild(
      NavGroup({
        href: "#",
        count: stats.total,
        title: "all",
        className: "fas fa-asterisk",
      })
    );

    if (SETTINGS.SHOWDONE) {
      this.container.appendChild(
        NavGroup(
          {
            href: "#done-true",
            count: stats.done,
            title: "done",
            className: Icons["true"],
          },
          {
            href: "#done-false",
            count: stats.total - stats.done,
            title: "to do",
            className: Icons["false"],
          }
        )
      );
    }

    const types = stats.getSortedTypes(SETTINGS.STATSNUMTYPE);

    this.container.appendChild(
      NavGroup(
        ...types.map((type) => ({
          href: `#type-${type.name}`,
          count: type.count,
          title: type.name,
          className: Icons[type.name],
        }))
      )
    );

    if (stats.terms) {
      this.container.appendChild(
        NavGroup({
          href: "#term",
          count: stats.terms,
          title: "terms",
          className: "fas fa-ribbon",
        })
      );
    }

    const tags = stats.getSortedTags(SETTINGS.STATSNUMTAGS);

    if (tags) {
      this.container.appendChild(
        Container(
          { className: "nav-itemgroup" },
          Container(
            { className: "nav-tagcontainer" },
            createElement("i", {
              title: "tags",
              className: "nav-tagicon fas fa-tag",
            }),
            tags.map((tag) =>
              Anchor(
                { className: "nav-tag", href: `tag-${tag.name}` },
                Container({ className: "nav-tagcount" }, tag.count),
                Container({ className: "nav-taglabel" }, tag.name)
              )
            )
          )
        )
      );
    }
  }
}
