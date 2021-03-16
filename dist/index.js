(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __commonJS = (callback, module) => () => {
    if (!module) {
      module = {exports: {}};
      callback(module.exports, module);
    }
    return module.exports;
  };
  var __exportStar = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module) => {
    return __exportStar(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? {get: () => module.default, enumerable: true} : {value: module, enumerable: true})), module);
  };

  // node_modules/transmat/lib/data_transfer.js
  var require_data_transfer = __commonJS((exports) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    exports.setMinimalDragImage = exports.normalizeType = exports.getDataTransfer = void 0;
    function getDataTransfer(event) {
      var _a;
      const dataTransfer2 = (_a = event.clipboardData) !== null && _a !== void 0 ? _a : event.dataTransfer;
      if (!dataTransfer2) {
        throw new Error("No DataTransfer available at this event.");
      }
      return dataTransfer2;
    }
    exports.getDataTransfer = getDataTransfer;
    function normalizeType(input) {
      const result = input.toLowerCase();
      switch (result) {
        case "text":
          return "text/plain";
        case "url":
          return "text/uri-list";
        default:
          return result;
      }
    }
    exports.normalizeType = normalizeType;
    function setMinimalDragImage2(transfer, width = 22, height = 18, square = 2, border = 4, colorA = "rgba(255,255,255,.5)", colorB = "rgba(0,0,0,.5)") {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      for (let x = 0; x < width / square; x++) {
        for (let y = 0; y < height / square; y++) {
          ctx.fillStyle = (x + y) % 2 ? colorA : colorB;
          ctx.fillRect(x * square, y * square, square, square);
        }
      }
      ctx.clearRect(border, border, width - border * 2, height - border * 2);
      Object.assign(canvas.style, {
        width: `${width}px`,
        height: `${height}}px`,
        position: "absolute",
        left: "-999px"
      });
      document.body.appendChild(canvas);
      transfer.setDragImage(canvas, width / 2, height / 2);
      setTimeout(() => {
        canvas.remove();
      });
    }
    exports.setMinimalDragImage = setMinimalDragImage2;
  });

  // node_modules/transmat/lib/mime_type.js
  var require_mime_type = __commonJS((exports) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    exports.match = exports.parse = void 0;
    function parse(input) {
      const [essence, ...paramSets] = input.trim().toLowerCase().split(";");
      const [type, subtype] = essence.split("/");
      if (!type || !subtype) {
        throw new Error("Invalid mime type. Missing type or subtype.");
      }
      const params = new Map();
      for (const p of paramSets) {
        const [key, ...value] = p.split("=");
        params.set(key, value.join("="));
      }
      return {
        type,
        subtype,
        params
      };
    }
    exports.parse = parse;
    function match(src, compare) {
      for (const key of [...src.params.keys()]) {
        if (src.params.get(key) !== compare.params.get(key)) {
          return false;
        }
      }
      return src.type === compare.type && src.subtype === compare.subtype;
    }
    exports.match = match;
  });

  // node_modules/transmat/lib/utils.js
  var require_utils = __commonJS((exports) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    exports.removeEventListeners = exports.addEventListeners = void 0;
    function addEventListeners(target, types, listener, options) {
      for (const type of types) {
        target.addEventListener(type, listener, options);
      }
      return () => {
        removeEventListeners(target, types, listener, options);
      };
    }
    exports.addEventListeners = addEventListeners;
    function removeEventListeners(target, types, listener, options) {
      for (const type of types) {
        target.removeEventListener(type, listener, options);
      }
    }
    exports.removeEventListeners = removeEventListeners;
  });

  // node_modules/transmat/lib/transmat.js
  var require_transmat = __commonJS((exports) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    exports.addListeners = exports.Transmat = void 0;
    var data_transfer_1 = require_data_transfer();
    var mimeType = require_mime_type();
    var utils_1 = require_utils();
    var Transmat2 = class {
      constructor(event) {
        this.event = event;
        this.dataTransfer = data_transfer_1.getDataTransfer(event);
      }
      accept(dropEffect) {
        if (this.event.type === "dragover") {
          if (dropEffect) {
            this.dataTransfer.dropEffect = dropEffect;
          }
          this.event.preventDefault();
        }
        if (this.event.type === "drop") {
          this.event.preventDefault();
        }
        return this.event.type === "drop" || this.event.type === "paste";
      }
      hasType(input) {
        const normalizedInput = data_transfer_1.normalizeType(input);
        return this.dataTransfer.types.some((type) => {
          const normalizedType = data_transfer_1.normalizeType(type);
          try {
            return mimeType.match(mimeType.parse(normalizedInput), mimeType.parse(normalizedType));
          } catch (_a) {
            return normalizedInput === normalizedType;
          }
        });
      }
      getData(type) {
        return this.hasType(type) ? this.dataTransfer.getData(data_transfer_1.normalizeType(type)) : void 0;
      }
      setData(typeOrEntries, data) {
        if (typeof typeOrEntries === "string") {
          this.setData({[typeOrEntries]: data});
        } else {
          for (const [type, data2] of Object.entries(typeOrEntries)) {
            const stringData = typeof data2 === "object" ? JSON.stringify(data2) : `${data2}`;
            this.dataTransfer.setData(data_transfer_1.normalizeType(type), stringData);
          }
        }
      }
    };
    exports.Transmat = Transmat2;
    function addListeners2(target, type, listener, options = {dragDrop: true, copyPaste: true}) {
      const isTransmitEvent = type === "transmit";
      let unlistenCopyPaste;
      let unlistenDragDrop;
      if (options.copyPaste) {
        const events = isTransmitEvent ? ["cut", "copy"] : ["paste"];
        const parentElement = target.parentElement;
        unlistenCopyPaste = utils_1.addEventListeners(parentElement, events, (event) => {
          if (!target.contains(document.activeElement)) {
            return;
          }
          listener(event, target);
          if (event.type === "copy" || event.type === "cut") {
            event.preventDefault();
          }
        });
      }
      if (options.dragDrop) {
        const events = isTransmitEvent ? ["dragstart"] : ["dragover", "drop"];
        unlistenDragDrop = utils_1.addEventListeners(target, events, (event) => {
          listener(event, target);
        });
      }
      return () => {
        unlistenCopyPaste && unlistenCopyPaste();
        unlistenDragDrop && unlistenDragDrop();
      };
    }
    exports.addListeners = addListeners2;
  });

  // node_modules/transmat/lib/transmat_observer.js
  var require_transmat_observer = __commonJS((exports) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    exports.TransmatObserver = void 0;
    var utils_1 = require_utils();
    var TransmatObserver2 = class {
      constructor(callback) {
        this.callback = callback;
        this.targets = new Set();
        this.prevRecords = [];
        this.removeEventListeners = () => {
        };
        this.onTransferEvent = (event) => {
          const records = [];
          for (const target of this.targets) {
            const isLeavingDrag = event.type === "dragleave" && (event.target === document.body || event.target === document.body.parentElement);
            const isActive = event.type !== "drop" && event.type !== "dragend" && !isLeavingDrag;
            const isTargetNode = target.contains(event.target);
            const isTarget = isActive && isTargetNode && event.type === "dragover";
            records.push({
              target,
              event,
              isActive,
              isTarget
            });
          }
          if (!entryStatesEqual(records, this.prevRecords)) {
            this.prevRecords = records;
            this.callback(records, this);
          }
        };
      }
      addEventListeners() {
        const listener = this.onTransferEvent;
        this.removeEventListeners = utils_1.addEventListeners(document, ["dragover", "dragend", "dragleave", "drop"], listener, true);
      }
      takeRecords() {
        return this.prevRecords;
      }
      observe(target) {
        this.targets.add(target);
        if (this.targets.size === 1) {
          this.addEventListeners();
        }
      }
      unobserve(target) {
        this.targets.delete(target);
        if (this.targets.size === 0) {
          this.removeEventListeners();
        }
      }
      disconnect() {
        this.targets.clear();
        this.removeEventListeners();
      }
    };
    exports.TransmatObserver = TransmatObserver2;
    function entryStatesEqual(a, b) {
      if (a.length !== b.length) {
        return false;
      }
      return a.every((av, index) => {
        const bv = b[index];
        return av.isActive === bv.isActive && av.isTarget === bv.isTarget;
      });
    }
  });

  // node_modules/transmat/lib/index.js
  var require_lib = __commonJS((exports) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    exports.TransmatObserver = exports.addListeners = exports.Transmat = void 0;
    var transmat_1 = require_transmat();
    Object.defineProperty(exports, "Transmat", {enumerable: true, get: function() {
      return transmat_1.Transmat;
    }});
    Object.defineProperty(exports, "addListeners", {enumerable: true, get: function() {
      return transmat_1.addListeners;
    }});
    var transmat_observer_1 = require_transmat_observer();
    Object.defineProperty(exports, "TransmatObserver", {enumerable: true, get: function() {
      return transmat_observer_1.TransmatObserver;
    }});
  });

  // node_modules/transmat/lib/json_ld.js
  var require_json_ld = __commonJS((exports) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    exports.isType = exports.getByType = exports.getAllByType = exports.find = exports.findAll = exports.getValues = exports.getValue = exports.fromObject = exports.parse = exports.MIME_TYPE = void 0;
    exports.MIME_TYPE = "application/ld+json";
    function parse(data) {
      return JSON.parse(data, (key, value) => {
        switch (value) {
          case "https://schema.org/True":
            return true;
          case "https://schema.org/False":
            return false;
          default:
            return value;
        }
      });
    }
    exports.parse = parse;
    function fromObject2(data) {
      if (typeof data === "string") {
        throw new Error("Only objects are supported.");
      }
      return {
        "@context": "https://schema.org",
        ...data
      };
    }
    exports.fromObject = fromObject2;
    function getValue(input) {
      const value = Array.isArray(input) ? input[0] : input;
      const pronounceableText = getByType(value, "PronounceableText");
      if (pronounceableText && pronounceableText.textValue) {
        return getValue(pronounceableText.textValue);
      }
      return value;
    }
    exports.getValue = getValue;
    function getValues(input) {
      const inputArray = Array.isArray(input) ? input : [input];
      const results = [];
      for (const v of inputArray) {
        const scalar = getValue(v);
        if (scalar !== void 0) {
          results.push(scalar);
        }
      }
      return results;
    }
    exports.getValues = getValues;
    function findAll(data, matcher, limit = 0, results = []) {
      if (!data || limit && results.length === limit) {
        return results;
      }
      if (matcher(data)) {
        results.push(data);
      }
      for (const value of Object.values(data)) {
        if (isObject(value)) {
          findAll(value, matcher, limit, results);
        }
      }
      return results;
    }
    exports.findAll = findAll;
    function find(data, matcher) {
      return findAll(data, matcher, 1)[0];
    }
    exports.find = find;
    function getAllByType(data, type, limit = 0) {
      return findAll(data, (obj) => isType(obj, type), limit);
    }
    exports.getAllByType = getAllByType;
    function getByType(data, type) {
      return getAllByType(data, type, 1)[0];
    }
    exports.getByType = getByType;
    function isType(obj, type) {
      if (!isObject(obj)) {
        return false;
      }
      const objType = obj["@type"];
      return Array.isArray(objType) ? objType.includes(type) : objType === type;
    }
    exports.isType = isType;
    function isObject(input) {
      return input !== null && typeof input === "object";
    }
  });

  // src/demo.ts
  var import_transmat = __toModule(require_lib());
  var jsonLd = __toModule(require_json_ld());
  var dataTransfer = __toModule(require_data_transfer());
  (0, import_transmat.addListeners)(document.querySelector(".minimal-drag-image"), "transmit", (event) => {
    const transmat = new import_transmat.Transmat(event);
    dataTransfer.setMinimalDragImage(transmat.dataTransfer);
    transmat.setData("text/plain", "This is a demo!");
  });
  (0, import_transmat.addListeners)(document.querySelector(".transmitter"), "transmit", (event) => {
    const data = {
      "@type": "TVSeries",
      name: "Doctor Who",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/23/DW_4.jpg",
      url: "https://en.wikipedia.org/wiki/Doctor_Who"
    };
    const transfer = new import_transmat.Transmat(event);
    transfer.setData({
      "text/uri-list": data.url,
      "text/plain": `${data.name}`,
      "text/html": `<a href="${data.url}"><img src="${data.image}" alt="${data.name}" /></a>`,
      [jsonLd.MIME_TYPE]: jsonLd.fromObject(data)
    });
  });
  (0, import_transmat.addListeners)(document.querySelector(".receiver"), "receive", (event) => {
    const transfer = new import_transmat.Transmat(event);
    if (transfer.accept("copy")) {
      clearLog();
      document.querySelector(".results").classList.add("show");
      for (const type of transfer.dataTransfer.types) {
        const data = transfer.getData(type);
        log(`${type}:
${data}
`);
        console.log({type, data});
      }
      updateReceiverText(`
        <strong>Data received.</strong><br />
        <em>Check out your console or the log below.</em>`);
    }
  });
  var logEl = document.querySelector(".demo .results code");
  function log(strLine) {
    logEl.appendChild(document.createTextNode(strLine + "\n"));
  }
  function clearLog() {
    logEl.innerHTML = "";
  }
  var resetTimer;
  function updateReceiverText(text) {
    clearTimeout(resetTimer);
    resetTimer = void 0;
    const el = document.querySelector(".receiver span");
    el.innerHTML = text;
    el.parentElement.classList.add("received");
    resetTimer = setTimeout(() => {
      el.innerHTML = "Drag or paste here!";
      el.parentElement.classList.remove("received");
    }, 5e3);
  }
  var observer = new import_transmat.TransmatObserver((entries) => {
    const entry = entries[0];
    entry.target.classList.toggle("transfer-active", entry.isActive);
    entry.target.classList.toggle("transfer-hover", entry.isTarget);
  });
  observer.observe(document.querySelector(".receiver"));
  for (const el of Array.from(document.querySelectorAll(".demo .intro a"))) {
    el.addEventListener("click", (ev) => {
      const width = Math.min(1200, screen.width);
      const height = Math.min(900, screen.height);
      const left = Math.round((screen.width - width) / 2);
      const top = Math.round((screen.height - height) / 2);
      window.open(ev.target.href, "", `menubar=1,toolbar=1,width=${width},height=${height},left=${left},top=${top}`);
      ev.preventDefault();
    });
  }
})();
