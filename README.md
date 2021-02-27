# Transmat
> Transfer data from between webpages, browsers, and applications on the user's
> device. Transmat will ease the implementation of this native browser feature.

![Build status](https://github.com/google/transmat/actions/workflows/node.js.yml/badge.svg)

## How does this work?
By utilizing the [DataTransfer API](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer)
capabilities to transfer data between any application on the user's device. This
technique is [compatible](https://caniuse.com/mdn-api_datatransfer_setdata) with
many browsers across devices.

### Transmitting data
The DataTransfer payload consists of simple string-based key value pairs. When
providing mime-types keys and their expected data, new integrations can happen,
sometimes for free.

```js
import {TransmatTransfer} from 'transmat';

TransmatTransfer.addTransmitListeners(myElement, event => {
  const transmat = new TransmatTransfer(event);
  transmat.setData({
    'text/plain': 'This will show up in text fields',
    'text/html': '<img src="https://example.com/test.jpg" />',
    'text/uri-list': 'https://example.com/foobar',
    'application/x.my-custom-type': {foo: 'bar'},
  });
});
```

When transfering the example from above, you can expect the following to happen
depending on the receiving target;

- WYSYWIG inputs like contentEditable, Google Docs, Gmail, Apple Pages will use
  `text/html` data, and fallback to `text/plain`.
- Text inputs like textareas, VSCode, will show `text/plain`.
- Browsers will navigate the URLs listed in the `text/uri-list` data.

### Receiving data
You can receive the DataTransfer payload by listening to the `drop` and `paste`
events.

```js
TransmatTransfer.addReceiveisteners(myElement, event => {
  const myCustomMimeType = 'application/x.my-custom-type';
  const transmat = new TransmatTransfer(event);
  if(transmat.hasType(myCustomMimeType) && transmat.acceptTransfer()) {
    const dataString = transmat.getData(myCustomMimeType);
    const data = JSON.parse(dataString);
    console.log(data);
  }
});
```

## Connecting the web, and beyond
The project's vision is to connect the web. By promoting the use of JSON-LD data
transfers, applications will be able to speak the same language indepently from
their implementation. With growing adoption, users will be able to transfer data
without friction to any other applications, across the web. How cool is that?

```js
import {Person} from 'schema-dts';
import {TransmatTransfer} from 'transmat';
import * as jsonLd from 'transmat/json_ld';

// When transmitting...
const transmat = new TransmatTransfer(event);
transmat.setData(jsonLd.MIME_TYPE, jsonLd.fromObject<Person>({
  "@type": "Person",
  "name": "Rory Gilmore",
  "image": "https://example.com/rory.jpg",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "USA",
    "addressRegion": "Connecticut",
    "addressLocality": "Stars Hollow"
  },
}));

// .. and when receiving
if (transmat.hasType(jsonLd.MIME_TYPE)) {
  const person = jsonLd.getData<Person>(jsonLd.MIME_TYPE);
}
```

- [Learn more about JSON-LD](https://json-ld.org/)
- [Schema.org types](https://schema.org/Thing)

## Observing transfer events
You can make use of the included `TransmatObserver` class to respond to drag
activity. Use this to for example highlight valid drop areas.

```js
import {TransmatObserver} from 'transmat';

const obs = new TransmatObserver(entries => {
  for (const entry of entries) {
    const transmat = new TransmatTransfer(entry.event);
    if(transmat.hasMimeType(myCustomMimeType)) {
      entry.target.classList.toggle('drag-over', entry.dragover);
      entry.target.classList.toggle('drag-active', entry.active);
    }
  }
});
obs.observe(myElement);
```

## Some concerns
### Discoverability
Drag-drop and copy-paste are native interactions, with roots back to the first
GUIs about 40 years ago. On the desktop, these are common operations that users
will do often. Think about organizing files, dragging files to tools to open
them, etc. On the web, this is uncommon.

We will need to educate users about this new capability, and ideally come up
with UX patterns to make this recognizable.

### Accessiblity
Drag-drop is not a very accessible interaction, but the DataTransfer API works
with copy-paste too.

### Security and privacy
The data stored in the DataTransfer will be available to any application on the
user's device. Keep this in mind when transfering sensitive data.

Receiving data should be threated like any any other user input; santize and
validate before using.

## Known quirks
- Chrome strips newlines in `text/uri-list`. For now, you can only use this to
  transfer a single URI. https://crbug.com/239745
- Transfering of generated files using `new File()` doesn't seem to be supported
  well enough.
- Webapplications can only read the payload (using
  [getData](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/getData))
  when finishing the transfer by dropping or pasting. While dragging , only the
  [types](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types)
  can be read.
- The DataTransfer data keys are transformed to lowercase.

## Contact
Use GitHub issues for filing bugs. Follow
[@jorikdelaporik](https://twitter.com/jorikdelaporik) on Twitter for occasional
updates around the project.
