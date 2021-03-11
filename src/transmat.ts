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
  DataTransferDropEffect,
  DataTransferEvent,
  getDataTransfer,
  normalizeType,
} from './data_transfer';
import * as mimeType from './mime_type';
import {addEventListeners} from './utils';

/**
 * Transmat encapsulates the DataTransfer object and provides some helpers to
 * ease the integration of the drag and copy interactions.
 */
export class Transmat {
  public readonly event: DataTransferEvent;
  public readonly dataTransfer: DataTransfer;

  constructor(event: DataTransferEvent) {
    this.event = event;
    this.dataTransfer = getDataTransfer(event);
  }

  /**
   * Tell the browser to proceed with the data transfer. Returns whether the
   * event is a receiving event, e.g. whether the data can be accessed.
   */
  accept(dropEffect?: DataTransferDropEffect): boolean {
    if (this.event.type === 'dragover') {
      if (dropEffect) {
        this.dataTransfer.dropEffect = dropEffect;
      }
      this.event.preventDefault();
    }
    if (this.event.type === 'drop') {
      // Prevent some browsers from redirecting.
      this.event.preventDefault();
    }
    return this.event.type === 'drop' || this.event.type === 'paste';
  }

  /** Whether the DataTransfer contains the provided key */
  hasType(input: string): boolean {
    const normalizedInput = normalizeType(input);
    return this.dataTransfer.types.some(type => {
      const normalizedType = normalizeType(type);
      try {
        return mimeType.match(
          mimeType.parse(normalizedInput),
          mimeType.parse(normalizedType)
        );
      } catch {
        // Just in case the string inputs are the same.
        return normalizedInput === normalizedType;
      }
    });
  }

  /** Get data by type. */
  getData(type: string): string | undefined {
    return this.hasType(type)
      ? this.dataTransfer.getData(normalizeType(type))
      : undefined;
  }

  /** Set data for a single or multiple entries. */
  setData(
    typeOrEntries: string | {[type: string]: unknown},
    data?: unknown
  ): void {
    if (typeof typeOrEntries === 'string') {
      this.setData({[typeOrEntries]: data});
    } else {
      for (const [type, data] of Object.entries(typeOrEntries)) {
        const stringData =
          typeof data === 'object' ? JSON.stringify(data) : `${data}`;
        this.dataTransfer.setData(normalizeType(type), stringData);
      }
    }
  }
}

/** Type of listener. */
export type TransferEventType = 'transmit' | 'receive';

/**
 * Setup listeners. Returns a function to remove the event listeners.
 * Optionally you can change the event types that will be listened to.
 */
export function addListeners<T extends Node>(
  target: T,
  type: TransferEventType,
  listener: (event: DataTransferEvent, target: T) => void,
  options = {dragDrop: true, copyPaste: true}
): () => void {
  const isTransmitEvent = type === 'transmit';
  let unlistenCopyPaste: undefined | (() => void);
  let unlistenDragDrop: undefined | (() => void);

  if (options.copyPaste) {
    const events = isTransmitEvent ? ['cut', 'copy'] : ['paste'];
    const parentElement = target.parentElement!;
    unlistenCopyPaste = addEventListeners(parentElement, events, event => {
      if (!target.contains(document.activeElement)) {
        return;
      }
      listener(event as DataTransferEvent, target);

      // The default behavior of copy and cut needs to be prevented, otherwise
      // DataTransfer won't work.
      if (event.type === 'copy' || event.type === 'cut') {
        event.preventDefault();
      }
    });
  }

  if (options.dragDrop) {
    const events = isTransmitEvent ? ['dragstart'] : ['dragover', 'drop'];
    unlistenDragDrop = addEventListeners(target, events, event => {
      listener(event as DataTransferEvent, target);
    });
  }

  return () => {
    unlistenCopyPaste && unlistenCopyPaste();
    unlistenDragDrop && unlistenDragDrop();
  };
}
