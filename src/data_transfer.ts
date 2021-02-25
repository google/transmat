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

/** Options for DataTransfer's dropEffect and allowEffect properies. */
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
