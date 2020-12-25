class Stats {
  constructor() {
    this.total = 0;
    this._types = {};
    this._tags = {};
    this.terms = 0;
    this.done = 0;
  }

  incrementTotal() {
    this.total++;
  }

  incrementType(type) {
    if (!type) return;

    if (this._types[type]) this._types[type]++;
    else this._types[type] = 1;
  }

  incrementTags(tags) {
    if (!tags) return;

    for (let tag of tags) {
      if (this._tags[tag]) this._tags[tag]++;
      else this._tags[tag] = 1;
    }
  }

  incrementTerm(term) {
    if (!term) return;

    let count = 0;

    for (let t of term) if (t.substr(0, 2) === "> ") count++;

    this.terms += count;
  }

  incrementDone(done) {
    if (!done || done !== "true") return;

    this.done++;
  }

  getSortedTypes(count) {
    // SORT TYPES, TAKE TOP X
    // Create items array
    var typeItems = Object.keys(this._types).map((type) => ({
      name: type,
      count: this._types[type],
    }));

    // Sort the array based on the type's count
    typeItems.sort((first, second) => second.count - first.count);

    return typeItems.slice(0, count);
  }

  getSortedTags(count) {
    // SORT TAGS, TAKE TOP X
    // Create items array
    var tagItems = Object.keys(this._tags).map((tag) => ({
      name: tag,
      count: this._tags[tag],
    }));

    // Sort the array based on the tag's count
    tagItems.sort((first, second) => second.count - first.count);

    return tagItems.slice(0, count);
  }
}
