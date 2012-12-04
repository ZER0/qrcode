const { data } = require("self");
const { Item, PageContext, SelectionContext, URLContext } = require("context-menu");
const { Page } = require("page-worker");
const tabs = require("tabs");

let pageWorker = Page({
  contentURL: data.url("canvas.html")
});

pageWorker.port.on("qrcode", function(url){
  tabs.open(url);
})

function Isolate(fn) {
  return "new " + fn;
}

function createQR(data) {
  pageWorker.port.emit("qrcode", data);
}

Item({
  label: "QRCode from URL",
  context: PageContext(),
  contentScript: Isolate(function(){
    self.on("click", function() {
      self.postMessage(document.URL);
    })
  }),
  onMessage: function(data) {
    createQR(data);
  }
});

Item({
  label: "QRCode from Map",
  context: URLContext(/https?:\/\/maps\.google\..*/),
  contentScript: Isolate(function() {
    self.on("context", function(node) {
      return !!(unsafeWindow.gApplication && unsafeWindow.gApplication.getMap);
    });

    self.on("click", function(node, data) {
      let coords = unsafeWindow.gApplication.getMap().getCenter();
      self.postMessage(coords.y + "," + coords.x);
    })
  }),
  onMessage: function(data) {
    createQR("GEO: " + data);
  }
});
