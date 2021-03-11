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

import {DataTransferEvent} from './data_transfer';
import {addEventListeners} from './utils';

/** Entries that will be emitted by the TransmatObserver. */
export interface TransmatObserverEntry {
  target: Element;
  event: DataTransferEvent;
  /** Whether a transfer operation is active in this window. */
  isActive: boolean;
  /** Whether the element is the active target (dragover). */
  isTarget: boolean;
}

/** Callback. */
export type TransmatObserverCallback = (
  entries: ReadonlyArray<TransmatObserverEntry>,
  observer: TransmatObserver
) => void;

/**
 * TransmatObserver will help you respond to drag interactions and can be used
 * for highlighting drop areas.
 */
export class TransmatObserver {
  private readonly targets = new Set<Element>();
  private prevRecords: ReadonlyArray<TransmatObserverEntry> = [];
  private removeEventListeners = () => {};

  constructor(private readonly callback: TransmatObserverCallback) {}

  private onTransferEvent = (event: DataTransferEvent) => {
    const records: TransmatObserverEntry[] = [];
    for (const target of this.targets) {
      // When the cursor leaves the browser it will be dispatched on the
      // body or html node.
      const isLeavingDrag =
        event.type === 'dragleave' &&
        (event.target === document.body ||
          event.target === document.body.parentElement);

      // Whether there is a drag happening on the page.
      const isActive =
        event.type !== 'drop' && event.type !== 'dragend' && !isLeavingDrag;

      // Whether the target is being dragged over.
      const isTargetNode = target.contains(event.target as Node);
      const isTarget = isActive && isTargetNode && event.type === 'dragover';

      records.push({
        target,
        event,
        isActive,
        isTarget,
      });
    }

    // Only emit when the records have changed.
    if (!entryStatesEqual(records, this.prevRecords)) {
      this.prevRecords = records as ReadonlyArray<TransmatObserverEntry>;
      this.callback(records, this);
    }
  };

  private addEventListeners() {
    const listener = this.onTransferEvent as EventListener;
    this.removeEventListeners = addEventListeners(
      document,
      ['dragover', 'dragend', 'dragleave', 'drop'],
      listener,
      true
    );
  }

  /** Returns the most recent emitted records. */
  takeRecords() {
    return this.prevRecords;
  }

  /** Observe the provided element. */
  observe(target: Element) {
    this.targets.add(target);
    if (this.targets.size === 1) {
      this.addEventListeners();
    }
  }

  /** Stop observing the provided element. */
  unobserve(target: Element) {
    this.targets.delete(target);
    if (this.targets.size === 0) {
      this.removeEventListeners();
    }
  }

  /** Clears all targets and listeners. */
  disconnect() {
    this.targets.clear();
    this.removeEventListeners();
  }
}

/** Returns whether the entries are equal. */
function entryStatesEqual(
  a: ReadonlyArray<TransmatObserverEntry>,
  b: ReadonlyArray<TransmatObserverEntry>
): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((av, index) => {
    const bv = b[index];
    return av.isActive === bv.isActive && av.isTarget === bv.isTarget;
  });
}
