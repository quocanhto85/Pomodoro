let tid = null;

self.onmessage = function (e) {
  if (e.data === "start") {
    if (tid) clearInterval(tid);
    tid = setInterval(function () {
      self.postMessage("tick");
    }, 500);
  } else if (e.data === "stop") {
    if (tid) {
      clearInterval(tid);
      tid = null;
    }
  }
};
