class Main {
  constructor() {
    this.util = null;
    this.wrap = null;
    this.articles = null;
    this.grid = null;
    this.nav = null;
    this.add = null;
    this.write = null;

    this.queryCur = "";
    this.queryPrev = "";
    this.queryPrevAdd = "";
    this.articlesDisplayed = 0;
  }

  install() {
    seer.note("load all js files");

    this.util = new Util();
    this.wrap = new Wrap();

    this.grid = new Grid();
    this.grid.install(
      document.querySelector("main"),
      document.querySelector(".page-overlay"),
      "main",
      "article"
    );

    this.nav = new Nav();
    this.nav.install(document.querySelector("nav"));

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
    if (this.queryCur !== "add") {
      this.queryPrev = this.queryCur;
    }
    target =
      target.substr(0, 1) === "#"
        ? target.substr(1, target.length - 1)
        : target;
    this.queryCur = target.trim();
    if (window.location.hash != this.queryCur) {
      window.location.hash = this.queryCur;
    }

    // DISPLAY
    let filtered = this.wrap.filter(this.queryCur, this.articles);
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
    let html = main.grid.buildAllArticles(filtered);
    seer.note("build html");

    main.grid.display(html);
    seer.report();

    document.querySelector(".loading-wave").style.display = "none";
  }
}

window.addEventListener("hashchange", function () {
  main.load();
});
