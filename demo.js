import {
  Transmat,
  TransmatObserver,
  addListeners,
} from "https://cdn.skypack.dev/transmat@0.0.1";
import { default as jsonLd } from "https://cdn.skypack.dev/transmat@0.0.1/dist/json_ld.js";

addListeners(document.querySelector(".transmitter"), "transmit", (event) => {
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

for (const el of document.querySelectorAll(".demo .intro a")) {
  el.addEventListener("click", (ev) => {
    const width = Math.min(1200, screen.width);
    const height = Math.min(900, screen.height);
    const left = Math.round((screen.width - width) / 2);
    const top = Math.round((screen.height - height) / 2);
    window.open(
      ev.target.href,
      "",
      `menubar=1,toolbar=1,width=${width},height=${height},left=${left},top=${top}`
    );
    ev.preventDefault();
  });
}
