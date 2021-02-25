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
 * TransmatTransfer encapsulates the DataTransfer object and provides some
 * helpers to ease the integration of the drag and copy interactions.
 */
export class TransmatTransfer {
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
  acceptTransfer(dropEffect: DataTransferDropEffect = 'copy'): boolean {
    if (this.event.type === 'dragover') {
      this.dataTransfer.dropEffect = dropEffect;
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
        // Browsers (at least Chrome) seem to lowercase the key. To ensure
        // consistency, we will also lowercase it.
        this.dataTransfer.setData(normalizeType(type), stringData);
      }
    }
  }

  /**
   * Sets transmit listeners. Returns a function to remove the event listeners.
   * Optionally you can change the event types that will be listened to.
   */
  static addTransmitListeners(
    target: EventTarget,
    listener: (event: DataTransferEvent) => void,
    options = {dragdrop: true, copypaste: true}
  ): () => void {
    const eventTypes: string[] = [];
    if (options.dragdrop) eventTypes.push('dragstart');
    if (options.copypaste) eventTypes.push('cut', 'copy');
    return addEventListeners(target, eventTypes, listener as EventListener);
  }

  /**
   * Sets receive listeners. Returns a function to remove the event listeners.
   * Optionally you can change the event types that will be listened to.
   */
  static addReceiveListeners(
    target: EventTarget,
    listener: (event: DataTransferEvent) => void,
    options = {dragdrop: true, copypaste: true}
  ): () => void {
    const eventTypes: string[] = [];
    if (options.dragdrop) eventTypes.push('dragover', 'drop');
    if (options.copypaste) eventTypes.push('paste');
    return addEventListeners(target, eventTypes, listener as EventListener);
  }
}
