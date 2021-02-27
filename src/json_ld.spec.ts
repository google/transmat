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
  describe('parse', () => {
    it('returns a typed object', () => {
      expect(
        jsonLd.parse<Person>(`{
          "@context": "https://schema.org",
          "@type": "Person",
          "image": "http://example.com/image.jpg"
        }`)
      ).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Person',
        image: 'http://example.com/image.jpg',
      });
    });
  });

  describe('fromObject', () => {
    it('adds missing schema information and returns an object', () => {
      expect(
        jsonLd.fromObject({
          image: 'http://example.com/image.jpg',
        })
      ).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Thing',
        image: 'http://example.com/image.jpg',
      });

      expect(
        jsonLd.fromObject<Person>({
          '@type': 'Person',
          name: 'Rory Gilmore',
        })
      ).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Rory Gilmore',
      });
    });
  });
});
