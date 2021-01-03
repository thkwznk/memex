class Main {
  constructor() {
    this.articles = null;
    this.add = null;
    this.write = null;

    this.articlesDisplayed = 0;

    seer.note("load all js files");

    this.wrap = new Wrap();

    this.grid = new Grid({
      container: document.querySelector("main"),
      numberOfColumns: 4,
    });

    this.nav = new Nav({
      container: document.querySelector("nav"),
    });

    seer.note("install main");
  }

  start() {
    this.db = this.wrap.start(DATABASE);
    seer.note("process db");

    this.articles = this.grid.buildAllArticles(this.db);
    seer.note("build html");

    let stats = this.wrap.stats(this.db);
    seer.note("calc stats");

    this.nav.display(stats);
    seer.note("render stats");

    this.load();
  }

  load() {
    // RESET
    lightbox.close();
    document.activeElement.blur();

    // DISPLAY
    let filtered = this.filter(this.getTarget(), this.articles);
    seer.note("filter db");

    let delay = 0;

    if (
      filtered.length > SETTINGS.LOADANIMNUM ||
      this.articlesDisplayed > SETTINGS.LOADANIMNUM
    ) {
      // adding or removing a large number of articles can take time, so show loader
      this.grid.clear();
      document.querySelector(".loading-wave").style.display = "inline-block";
      delay = 10; // Small delay gives the preloader time to display
    }

    this.articlesDisplayed = filtered.length;

    this.grid.display(filtered);
    seer.report();

    document.querySelector(".loading-wave").style.display = "none";
  }

  getTarget() {
    let target = document.location.hash;
    target = target.substr(0, 1) === "#" ? target.substr(1) : target;
    return target.trim();
  }

  filter(target, articles) {
    if (!target) return articles;

    if (target === "term") {
      return articles.filter((article) => article.getAttribute(target));
    }

    var splitTarget = target.split("-");
    let targetType = splitTarget[0];
    let targetName = decodeURI(splitTarget[1]);

    if (targetType == "tag") targetType = "tags";

    return articles.filter((article) => {
      const attribute = article.getAttribute(targetType);

      return attribute && attribute.includes(targetName);
    });
  }
}

window.addEventListener("hashchange", function () {
  main.load();
});
