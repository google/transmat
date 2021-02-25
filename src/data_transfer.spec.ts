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

import {getDataTransfer, normalizeType} from './data_transfer';

describe('dataTransfer', () => {
  describe('getDataTransfer', () => {
    it('returns the DataTransfer object from Drag events', () => {
      const event = new DragEvent('drag', {
        dataTransfer: new DataTransfer(),
      });
      expect(getDataTransfer(event)).toEqual(event.dataTransfer!);
    });

    it('returns the DataTransfer object from Clipboard events', () => {
      const event = new ClipboardEvent('copy', {
        clipboardData: new DataTransfer(),
      });
      expect(getDataTransfer(event)).toEqual(event.clipboardData!);
    });

    it('throws when there is no DataTransfer object', () => {
      const event = new ClipboardEvent('copy');
      expect(() => getDataTransfer(event)).toThrow();
    });
  });

  describe('normalizeType', () => {
    it('returns the type in lowercase', () => {
      expect(normalizeType('TEXT/HTML')).toBe('text/html');
    });

    it('converts "text" into "text/plain"', () => {
      expect(normalizeType('Text')).toBe('text/plain');
    });
  });
});
