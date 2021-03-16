import { Transmat, TransmatObserver, addListeners } from "transmat";
import * as jsonLd from "transmat/dist/json_ld";
import * as dataTransfer from "transmat/dist/data_transfer";

addListeners(
  document.querySelector(".minimal-drag-image")!,
  "transmit",
  (event) => {
    const transmat = new Transmat(event);
    dt.setMinimalDragImage(transmat.dataTransfer);
    transmat.setData("text/plain", "This is a demo!");
  }
);

addListeners(document.querySelector(".transmitter")!, "transmit", (event) => {
  const data = {
    "@type": "TVSeries",
    name: "Doctor Who",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/23/DW_4.jpg",
    url: "https://en.wikipedia.org/wiki/Doctor_Who",
  };

  const transfer = new Transmat(event);
  transfer.setData({
    "text/uri-list": data.url,
    "text/plain": `${data.name}`,
    "text/html": `<a href="${data.url}"><img src="${data.image}" alt="${data.name}" /></a>`,
    [jsonLd.MIME_TYPE]: jsonLd.fromObject(data),
  });
});

addListeners(document.querySelector(".receiver")!, "receive", (event) => {
  const transfer = new Transmat(event);
  if (transfer.accept("copy")) {
    clearLog();
    document.querySelector(".results")!.classList.add("show");
    for (const type of transfer.dataTransfer.types) {
      const data = transfer.getData(type);
      log(`${type}:\n${data}\n`);
      console.log({ type, data });
    }
    updateReceiverText(`
        <strong>Data received.</strong><br />
        <em>Check out your console or the log below.</em>`);
  }
});

const logEl = document.querySelector(".demo .results code")!;
function log(strLine: string) {
  logEl.appendChild(document.createTextNode(strLine + "\n"));
}

function clearLog() {
  logEl.innerHTML = "";
}

let resetTimer: undefined | number;
function updateReceiverText(text: string) {
  clearTimeout(resetTimer);
  resetTimer = undefined;

  const el = document.querySelector(".receiver span")!;
  el.innerHTML = text;
  el.parentElement!.classList!.add("received");
  resetTimer = setTimeout(() => {
    el.innerHTML = "Drag or paste here!";
    el.parentElement!.classList!.remove("received");
  }, 5000);
}

const observer = new TransmatObserver((entries) => {
  const entry = entries[0];
  entry.target.classList.toggle("transfer-active", entry.isActive);
  entry.target.classList.toggle("transfer-hover", entry.isTarget);
});
observer.observe(document.querySelector(".receiver")!);

for (const el of Array.from(document.querySelectorAll(".demo .intro a"))) {
  el.addEventListener("click", (ev) => {
    const width = Math.min(1200, screen.width);
    const height = Math.min(900, screen.height);
    const left = Math.round((screen.width - width) / 2);
    const top = Math.round((screen.height - height) / 2);
    window.open(
      (ev.target as HTMLAnchorElement).href!,
      "",
      `menubar=1,toolbar=1,width=${width},height=${height},left=${left},top=${top}`
    );
    ev.preventDefault();
  });
}
