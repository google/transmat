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

/** Events that contain a DataTransfer instance. */
export type DataTransferEvent = DragEvent | ClipboardEvent;

/** Options for DataTransfer's dropEffect and allowEffect properties. */
export type DataTransferDropEffect = 'move' | 'copy' | 'none' | 'link';

/** Returns the DataTransfer object from the event, or throws an error. */
export function getDataTransfer(event: DataTransferEvent): DataTransfer {
  const dataTransfer =
    (event as ClipboardEvent).clipboardData ??
    (event as DragEvent).dataTransfer;
  if (!dataTransfer) {
    throw new Error('No DataTransfer available at this event.');
  }
  return dataTransfer;
}

/** Returns a normalize type to align browser implementations. */
export function normalizeType(input: string) {
  // Browsers (at least Chrome) seem to lowercase the type. Enforce this to be
  // consistent across browsers.
  const result = input.toLowerCase();

  // IE and Opera return 'Text' when the type is 'text/plain'. Fix this quirk
  // by returning text/plain.
  return result === 'text' ? 'text/plain' : result;
}

/**
 * Sets a minimal drag image that will replace the default, but still give the
 * user the feeling of dragging an object when moving beyond the boundaries of
 * the browser.
 * An use-case for the minimal image is when using Transmat in combination with
 * existing drag-drop implementations.
 */
export function setMinimalDragImage(
  transfer: DataTransfer,
  width = 22,
  height = 18,
  square = 2,
  border = 4,
  colorA = 'rgba(255,255,255,.5)',
  colorB = 'rgba(0,0,0,.5)'
): void {
  // Render 2x size to optimize for HD screens, and scale down with CSS.
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Draw a checkered border.
  const ctx = canvas.getContext('2d')!;
  for (let x = 0; x < width / square; x++) {
    for (let y = 0; y < height / square; y++) {
      ctx.fillStyle = (x + y) % 2 ? colorA : colorB;
      ctx.fillRect(x * square, y * square, square, square);
    }
  }
  ctx.clearRect(border, border, width - border * 2, height - border * 2);

  // Chrome needs the dragImages to be appended to the DOM. Add it to the DOM
  // for short period and put it outside the viewport.
  Object.assign(canvas.style, {
    width: `${width}px`,
    height: `${height}}px`,
    position: 'absolute',
    left: '-999px',
  });
  document.body.appendChild(canvas);
  transfer.setDragImage(canvas, width / 2, height / 2);
  setTimeout(() => {
    canvas.remove();
  });
}
