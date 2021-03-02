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

import {TransmatObserver} from './transmat_observer';

/**
 * This test just checks the code, the actual behavior is a bit harder to test.
 * For now, this should be done manually with the files from /experiments.
 * @TODO Improve tests for the TransmatObserver.
 */
describe('TransmatObserver', () => {
  let callback: jasmine.Spy;
  let observer: TransmatObserver;
  let target: Element;
  beforeEach(() => {
    callback = jasmine.createSpy();
    observer = new TransmatObserver(callback);

    target = document.createElement('div');
    document.body.appendChild(target);
    observer.observe(target);
  });

  afterEach(() => {
    observer.disconnect();
    target.remove();
  });

  describe('observe', () => {
    it('will observe the target for dragover events', () => {
      const event = dispatchDragEvent('dragover', target);
      expect(callback).toHaveBeenCalledWith(
        [{event, target, isTarget: true, isActive: true}],
        observer
      );
    });

    it('will observe the target for dragend events', () => {
      const event = dispatchDragEvent('dragend', target);
      expect(callback).toHaveBeenCalledWith(
        [{event, target, isTarget: false, isActive: false}],
        observer
      );
    });

    it('will observe the root for dragend events', () => {
      const event = dispatchDragEvent('dragleave', document.body);
      expect(callback).toHaveBeenCalledWith(
        [{event, target, isTarget: false, isActive: false}],
        observer
      );
    });

    it('will not emit when the state has not changed', () => {
      dispatchDragEvent('dragover', target);
      dispatchDragEvent('dragover', target);
      dispatchDragEvent('dragend', target);
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('takeRecords', () => {
    it('returns the most recent entries', () => {
      dispatchDragEvent('dragover', target);
      const event = dispatchDragEvent('dragend', target);
      expect(observer.takeRecords()).toEqual([
        {event, target, isTarget: false, isActive: false},
      ]);
    });
  });

  describe('unobserve', () => {
    it('stops observing the target', () => {
      observer.unobserve(target);
      dispatchDragEvent('dragover', target);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('stops observing all targets', () => {
      observer.observe(document.body);
      observer.disconnect();
      dispatchDragEvent('dragover', target);
      expect(callback).not.toHaveBeenCalled();
    });
  });
});

function dispatchDragEvent(type: string, target: Element) {
  const event = new DragEvent(type, {bubbles: true, cancelable: true});
  target.dispatchEvent(event);
  return event;
}
