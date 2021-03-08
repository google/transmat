import {
  Transmat,
  TransmatObserver,
  addListeners,
} from "https://cdn.skypack.dev/transmat@0.0.1";
import { default as jsonLd } from "https://cdn.skypack.dev/transmat@0.0.1/dist/json_ld.js";

addListeners(document.querySelector(".transmitter"), "transmit", (event) => {
  const data = {
    "@type": "Person",
    name: "Rory Gilmore",
    image:
      "https://upload.wikimedia.org/wikipedia/en/8/8f/Rory_Gilmore_season_1.jpg",
    url: "https://www.imdb.com/title/tt0238784/",
  };

  const transfer = new Transmat(event);
  transfer.setData({
    "text/uri-list": data.url,
    "text/plain": `${data.name}`,
    "text/html": `<h2>${data.name}</h2><img src="${data.image}" alt="logo" />`,
    [jsonLd.MIME_TYPE]: jsonLd.fromObject(data),
  });
});

addListeners(document.querySelector(".receiver"), "receive", (event) => {
  const transfer = new Transmat(event);
  if (transfer.accept("copy")) {
    console.log("Received the following data:");
    for (const type of transfer.dataTransfer.types) {
      console.log({ type, data: transfer.getData(type) });
    }
    updateReceiverText(`
        <strong>Data received.</strong><br />
        <em>Open your console to review</em>`);
  }
});

let resetTimer = null;
function updateReceiverText(text) {
  clearTimeout(resetTimer);
  resetTimer = null;

  const el = document.querySelector(".receiver span");
  el.innerHTML = text;
  el.parentNode.classList.add("received");
  resetTimer = setTimeout(() => {
    el.innerHTML = "Drag or paste here!";
    el.parentNode.classList.remove("received");
  }, 5000);
}

const observer = new TransmatObserver((entries) => {
  const entry = entries[0];
  entry.target.classList.toggle("transfer-active", entry.isActive);
  entry.target.classList.toggle("transfer-hover", entry.isTarget);
});
observer.observe(document.querySelector(".receiver"));
