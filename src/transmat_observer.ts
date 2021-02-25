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
import {addEventListeners, removeEventListeners} from './utils';

/** Entries that will be emitted by the TransmatObserver. */
export interface TransmatObserverEntry {
  target: Element;
  event: DataTransferEvent;
  active: boolean; // Whether a drag operation is active in this browser window.
  dragover: boolean; // Whether it is beind dragged over.
}

/** Configurable options. */
export interface TransmatObserverOptions {
  root: Document | Element;
}

/** Callback. */
export type TransmatObserverCallback = (
  entries: ReadonlyArray<TransmatObserverEntry>,
  observer: TransmatObserver
) => void;

const DEFAULT_OPTIONS = {
  root: document,
};

/**
 * TransmatObserver will help you respond to drag interactions and can be used
 * for highlighting drop areas.
 */
export class TransmatObserver {
  private readonly targets = new Set<Element>();
  private readonly options: TransmatObserverOptions;

  constructor(
    private readonly callback: TransmatObserverCallback,
    options?: Partial<TransmatObserverOptions>
  ) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  private prevRecords: ReadonlyArray<TransmatObserverEntry> = [];

  private onTransferEvent = (event: DataTransferEvent) => {
    const records: TransmatObserverEntry[] = [];
    const htmlNode = document.querySelector('html');
    this.targets.forEach(target => {
      // These state properties need to be verified, not sure if they are correct.
      // Especially 'active' is a hard one.
      const active =
        event.type !== 'dragend' &&
        !(
          event.type === 'dragleave' &&
          (event.target === document.body || event.target === htmlNode)
        );

      const isTarget = hasNode(target, event.target as Node);
      const dragover = isTarget && event.type === 'dragover';

      records.push({
        target,
        event,
        active,
        dragover,
      });
    });

    // Only emit when the records have changed.
    if (!entryStatesEqual(records, this.prevRecords)) {
      this.prevRecords = records as ReadonlyArray<TransmatObserverEntry>;
      this.callback(records, this);
    }
  };

  private addEventListeners() {
    addEventListeners(
      this.options.root,
      ['dragover', 'dragend'],
      this.onTransferEvent as EventListener
    );
    this.options.root.addEventListener(
      'dragleave',
      this.onTransferEvent as EventListener,
      true
    );
  }

  private removeEventListeners() {
    removeEventListeners(
      this.options.root,
      ['dragover', 'dragend'],
      this.onTransferEvent as EventListener
    );
    this.options.root.removeEventListener(
      'dragleave',
      this.onTransferEvent as EventListener,
      true
    );
  }

  takeRecords() {
    return this.prevRecords;
  }

  observe(target: Element) {
    this.targets.add(target);
    if (this.targets.size === 1) {
      this.addEventListeners();
    }
  }

  unobserve(target: Element) {
    this.targets.delete(target);
    if (this.targets.size === 0) {
      this.removeEventListeners();
    }
  }

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
    // Only compare the boolean values, these only matter
    return av.active === bv.active && av.dragover === bv.dragover;
  });
}

/**
 * Whether the provided parent node contains the node. Traverses up from the
 * Node, instead of down from the parentNode.
 */
function hasNode(parentNode: Node, node: Node | null): boolean {
  while (node) {
    if (node === parentNode) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
