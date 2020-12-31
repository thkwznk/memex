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
    this.articles = this.wrap.start(DATABASE);
    seer.note("process db");

    let stats = this.wrap.stats(this.articles);
    seer.note("calc stats");

    this.nav.display(stats);
    seer.note("render stats");

    this.load();
  }

  load() {
    // RESET
    lightbox.close();
    document.activeElement.blur();

    // UPDATE QUERY
    let target = window.document.location.hash;

    target =
      target.substr(0, 1) === "#"
        ? target.substr(1, target.length - 1)
        : target;

    let queryCurrent = target.trim();

    if (window.location.hash != queryCurrent) {
      window.location.hash = queryCurrent;
    }

    // DISPLAY
    let filtered = this.wrap.filter(queryCurrent, this.articles);
    let filteredLength = Object.keys(filtered).length;
    seer.note("filter db");

    let delay = 0;

    if (
      filteredLength > SETTINGS.LOADANIMNUM ||
      this.articlesDisplayed > SETTINGS.LOADANIMNUM
    ) {
      // adding or removing a large number of articles can take time, so show loader
      this.grid.clear();
      document.querySelector(".loading-wave").style.display = "inline-block";
      delay = 10; // Small delay gives the preloader time to display
    }
    this.articlesDisplayed = filteredLength;

    setTimeout(() => this.build(filtered), delay);
  }

  build(filtered) {
    let articles = this.grid.buildAllArticles(filtered);

    seer.note("build html");

    this.grid.display(articles);
    seer.report();

    document.querySelector(".loading-wave").style.display = "none";
  }
}

window.addEventListener("hashchange", function () {
  main.load();
});
