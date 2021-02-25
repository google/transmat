/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  addTransmitEventListener,
  addReceiveEventListener,
  getDataTransfer,
} from './bdb';
// import exampleImageName from './example.jpg';

const target = document.querySelector('#target');

// Read the image as a File.
let file;
const img = new Image();
img.addEventListener('load', () => {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  canvas.toBlob(blob => {
    console.log(blob);
    file = new File([blob], 'example.jpg', {type: 'image/png'});
  });
});
img.src = 'example.jpg';

addTransmitEventListener(target, ev => {
  const dt = getDataTransfer(ev)!;
  console.log(file);
  dt.items.add(file);
});

target.addEventListener('dragover', ev => ev.preventDefault());
addReceiveEventListener(target, ev => {
  const dt = getDataTransfer(ev)!;
  console.dir({
    datatransfer: dt,
    files: dt.files,
    filesLength: dt.files.length,
    items: dt.items,
    itemsCount: dt.items.length,
    types: dt.types,
  });

  for (const item of Array.from(dt.items)) {
    console.dir({
      item: item,
      type: item.type,
      asFile: item.getAsFile(),
      asString: item.getAsString(console.log),
    });
  }

  ev.preventDefault();
});
