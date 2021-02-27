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

import {TransmatTransfer} from './transmat_transfer';

describe('TransmatTransfer', () => {
  let tester: Element;
  beforeEach(() => {
    tester = document.createElement('div');
    document.body.appendChild(tester);
  });

  afterEach(() => {
    tester.remove();
  });

  describe('acceptTransfer', () => {
    it('returns true for drop and paste events', () => {
      const dropTransfer = new TransmatTransfer(createDragEvent('drop'));
      const pasteTransfer = new TransmatTransfer(createClipboardEvent('paste'));
      expect(dropTransfer.acceptTransfer()).toBeTrue();
      expect(pasteTransfer.acceptTransfer()).toBeTrue();
    });

    describe('dragover', () => {
      it('calls preventDefault and return false', done => {
        const unlisten = TransmatTransfer.addReceiveListeners(tester, event => {
          const transfer = new TransmatTransfer(event);
          expect(transfer.acceptTransfer()).toBeFalse();
          expect(event.defaultPrevented).toBeTrue();
          unlisten();
          done();
        });
        tester.dispatchEvent(createDragEvent('dragover'));
      });
    });
  });

  describe('hasType', () => {
    it('returns whether the given type is in the datatransfer', () => {
      const event = createDragEvent('drop');
      event.dataTransfer.setData('foo', 'foo value');
      event.dataTransfer.setData('text', 'text value');
      event.dataTransfer.setData('application/json+ld;identifier=Thing', '42');

      const t = new TransmatTransfer(event);
      expect(t.hasType('foo')).toBeTrue();
      expect(t.hasType('text')).toBeTrue();
      expect(t.hasType('text/plain')).toBeTrue();
      expect(t.hasType('application/json+ld')).toBeTrue();
      expect(t.hasType('application/json+ld;identifier=Thing')).toBeTrue();
      expect(t.hasType('application/json+ld;identifier=Person')).toBeFalse();
      expect(t.hasType('text/plain;foo=bar')).toBeFalse();
      expect(t.hasType('text/css')).toBeFalse();
    });
  });

  describe('getData', () => {
    it('returns the data for a given key', () => {
      const event = createDragEvent('drop');
      event.dataTransfer.setData('text/plain', 'foo value');

      const t = new TransmatTransfer(event);
      expect(t.getData('text/plain')).toBe('foo value');
      expect(t.getData('bar')).toBe(undefined);
    });
  });

  describe('setData', () => {
    it('sets a single data key-value pair', () => {
      const event = createDragEvent('drop');
      const t = new TransmatTransfer(event);
      t.setData('text/plain', 'text value');
      expect(t.dataTransfer.getData('text/plain')).toBe('text value');
    });

    it('sets multiple data key-value pairs', () => {
      const event = createDragEvent('drop');
      const t = new TransmatTransfer(event);
      t.setData({
        'text/plain': 'text value',
        'text/html': 'html value',
      });
      expect(t.dataTransfer.getData('text/plain')).toBe('text value');
      expect(t.dataTransfer.getData('text/html')).toBe('html value');
    });

    it('coverts values to string', () => {
      const event = createDragEvent('drop');
      const t = new TransmatTransfer(event);
      t.setData('foo', 123);
      t.setData('bar', {bar: true});
      t.setData('baz', [{baz: 123}]);
      expect(t.dataTransfer.getData('foo')).toBe('123');
      expect(t.dataTransfer.getData('bar')).toBe('{"bar":true}');
      expect(t.dataTransfer.getData('baz')).toBe('[{"baz":123}]');
    });
  });
});

function createDragEvent(type: string) {
  return new DragEvent(type, {
    dataTransfer: new DataTransfer(),
    bubbles: true,
    cancelable: true,
  });
}

function createClipboardEvent(type: string) {
  return new ClipboardEvent(type, {
    clipboardData: new DataTransfer(),
    bubbles: true,
    cancelable: true,
  });
}
