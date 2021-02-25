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
import * as jsonLd from './json_ld';
import {Person} from 'schema-dts';

describe('jsonLd', () => {
  describe('getMimeType', () => {
    it('returns a json-ld mimetype', () => {
      expect(jsonLd.getMimeType()).toBe('application/ld+json');
    });

    it('returns a json-ld mimetype with an identifier', () => {
      expect(jsonLd.getMimeType('Person')).toBe(
        'application/ld+json;identifier=person'
      );
    });
  });

  describe('hasType', () => {
    it('returns whether a JSON-LD mimetype is available', () => {
      const transfer = createTransmatTransfer();
      transfer.setData(jsonLd.getMimeType(), '{}');
      expect(jsonLd.hasType(transfer)).toBeTrue();
    });

    it('ignores the identifier when none provided', () => {
      const transfer = createTransmatTransfer();
      transfer.setData(jsonLd.getMimeType('Lorelai'), '{}');
      expect(jsonLd.hasType(transfer)).toBeTrue();
    });

    it('restricts to the identifier', () => {
      const transfer = createTransmatTransfer();
      transfer.setData(jsonLd.getMimeType('Lorelai'), '{}');
      expect(jsonLd.hasType(transfer, 'Lorelai')).toBeTrue();
      expect(jsonLd.hasType(transfer, 'foobar')).toBeFalse();
    });
  });

  describe('setData / getData', () => {
    it('adds a schema information and returns an object', () => {
      const transfer = createTransmatTransfer();
      jsonLd.setData(transfer, {
        image: 'http://example.com/image.jpg',
      });
      expect(jsonLd.getData(transfer)).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Thing',
        image: 'http://example.com/image.jpg',
      });
    });

    it('restricts to an identifier', () => {
      const transfer = createTransmatTransfer();
      const identifier = 'Emily';
      jsonLd.setData<Person>(
        transfer,
        {
          '@type': 'Person',
          name: 'Emily Gilmore',
        },
        identifier
      );
      expect(jsonLd.getData<Person>(transfer, 'Luke')).toBeUndefined();
      expect(jsonLd.getData<Person>(transfer, 'Emily')).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Emily Gilmore',
      });
    });
  });
});

function createTransmatTransfer() {
  const event = new DragEvent('dragover', {
    dataTransfer: new DataTransfer(),
    bubbles: true,
    cancelable: true,
  });
  return new TransmatTransfer(event);
}
