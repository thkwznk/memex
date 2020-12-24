class Util {
  constructor() {
    this.imageExtensionPattern = /\.(gif|jpg|jpeg|tiff|png)$/i;

    String.prototype.to_properCase = function () {
      return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };
  }

  buildIcon(type, label, altClass) {
    if (label == undefined) {
      label = type;
    }

    let labelElem = label != null ? `title="${label}" ` : ``;
    let iconClass = altClass || "article-icon";

    return `<i ${labelElem}class="${Icons[type]} textIcon ${iconClass}"></i>`;
  }

  isDefined(value) {
    return typeof value !== "undefined";
  }

  isObject(value) {
    return typeof value == "object";
  }

  isImage(filename) {
    return this.imageExtensionPattern.test(filename);
  }

  isType(typeArray, value) {
    if (this.isDefined(typeArray)) {
      for (var i = 0; i < typeArray.length; i++) {
        if (typeArray[i] == value) {
          return true;
        }
      }
    }
    return false;
  }

  // Source: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
  extractRootDomain(url) {
    var domain = this.extractHostname(url),
      splitArr = domain.split("."),
      arrLen = splitArr.length;

    // extracting the root domain here
    // if there is a subdomain
    if (arrLen > 2) {
      domain = splitArr[arrLen - 2] + "." + splitArr[arrLen - 1];
      // check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
      if (
        splitArr[arrLen - 2].length === 2 &&
        splitArr[arrLen - 1].length === 2
      ) {
        // this is using a ccTLD
        domain = splitArr[arrLen - 3] + "." + domain;
      }
    }
    return domain;
  }

  // Source: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
  extractHostname(url) {
    var hostname;
    // find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("://") > -1) {
      hostname = url.split("/")[2];
    } else {
      hostname = url.split("/")[0];
    }

    // find & remove port number
    hostname = hostname.split(":")[0];
    // find & remove "?"
    hostname = hostname.split("?")[0];

    return hostname;
  }
}
