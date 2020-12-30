const Util = {
  toProperCase: function (text) {
    return text.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },
  isImage: function (filename) {
    return /\.(gif|jpg|jpeg|tiff|png)$/i.test(filename);
  },
  isType: function (typeArray, value) {
    return typeArray && typeArray.some((t) => t === value);
  },
};
