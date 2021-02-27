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

import {addEventListeners, removeEventListeners} from './utils';

describe('utils', () => {
  let tester: Element;
  beforeEach(() => {
    tester = document.createElement('div');
    document.body.appendChild(tester);
  });

  afterEach(() => {
    tester.remove();
  });

  describe('addEventListeners', () => {
    it('adds listeners for each event and returns an unlisten function', () => {
      const listener = jasmine.createSpy();
      const unlisten = addEventListeners(tester, ['foo', 'bar'], listener);

      tester.dispatchEvent(new Event('foo'));
      tester.dispatchEvent(new Event('bar'));
      expect(listener.calls.allArgs()).toEqual([
        [new Event('foo')],
        [new Event('bar')],
      ]);

      unlisten();
      listener.calls.reset();
      tester.dispatchEvent(new Event('foo'));
      tester.dispatchEvent(new Event('bar'));
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('removeEventListeners', () => {
    it('removes the listeners for the given event types', () => {
      const listener = jasmine.createSpy();
      tester.addEventListener('foo', listener);
      tester.addEventListener('bar', listener);

      removeEventListeners(tester, ['foo', 'bar'], listener);
      tester.dispatchEvent(new Event('foo'));
      tester.dispatchEvent(new Event('bar'));
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
