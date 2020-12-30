"use strict";

class Seer {
  constructor({ verbose, quota = 1 }) {
    this.verbose = verbose;
    this.quota = quota;

    this.timeBegin = null;
    this.timeRef = null;
    this.book = null;
    this.limbo = false;

    this.rebirth();
  }

  rebirth() {
    this.timeBegin = Date.now();
    this.timeRef = Date.now();
    this.book = [];
    this.limbo = false;
  }

  note(description) {
    if (this.limbo) this.rebirth();

    var entry = { description, duration: Date.now() - this.timeRef };
    this.book.push(entry);

    if (this.verbose)
      console.log(`${entry.duration} ms to ${entry.description}`);

    this.timeRef = Date.now();
  }

  report() {
    let total = Date.now() - this.timeBegin;
    console.log(`Completed in: ${total} ms`);

    this.book.sort((a, b) => b.duration - a.duration);

    for (var i = 0; i < Math.min(this.quota, this.book.length); i++) {
      let entry = this.book[i];
      let percentage = ((entry.duration / total) * 100).toFixed(1);
      console.log(`${percentage} % (${entry.duration} ms) of time spent on: ${entry.description}`);
    }

    console.log("_____________________________");
    this.limbo = true;
  }
}
