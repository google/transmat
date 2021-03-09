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

import * as jsonLd from './json_ld';
import {Place, Person} from 'schema-dts';

describe('jsonLd', () => {
  const PERSON: Readonly<Person> = {
    '@type': 'Person',
    name: ['Rory Gilmore', 'Lorelai Gilmore'],
    additionalName: {
      '@type': 'PronounceableText',
      textValue: 'Rory',
    },
  };

  const PLACE: Readonly<Place> = {
    '@type': 'Place',
    geo: [
      {
        '@type': 'GeoCoordinates',
        name: 'Entrance',
        latitude: 37,
        longitude: -122,
      },
      {
        '@type': 'GeoCoordinates',
        name: 'Exit',
        latitude: 37,
        longitude: -122,
      },
    ],
  };

  describe('parse', () => {
    it('returns a typed object', () => {
      expect(
        jsonLd.parse<Place>(`{
          "@context": "https://schema.org",
          "@type": "Place",
          "image": "http://example.com/image.jpg"
        }`)
      ).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Place',
        image: 'http://example.com/image.jpg',
      });
    });

    it('replaces Schema booleans with actual booleans', () => {
      expect(
        jsonLd.parse<Place>(`{
          "@context": "https://schema.org",
          "@type": "Place",
          "smokingAllowed": "https://schema.org/True",
          "publicAccess": "https://schema.org/False"
        }`)
      ).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Place',
        smokingAllowed: true,
        publicAccess: false,
      });
    });
  });

  describe('fromObject', () => {
    it('adds missing schema information and returns an object', () => {
      expect(
        jsonLd.fromObject({
          '@type': 'Thing',
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
          name: 'Paris Geller',
        })
      ).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Paris Geller',
      });
    });
  });

  describe('getValue and getValues', () => {
    describe('getValue', () => {
      it('returns a single value', () => {
        expect(jsonLd.getValue(PERSON.name)).toBe('Rory Gilmore');
      });

      it('returns the textValue from PronounceableText', () => {
        expect(jsonLd.getValue(PERSON.additionalName)).toBe('Rory');
      });
    });

    describe('getValues', () => {
      it('returns a single value', () => {
        expect(jsonLd.getValues(PERSON.name)).toEqual([
          'Rory Gilmore',
          'Lorelai Gilmore',
        ]);
      });
    });
  });

  describe('find and findAll', () => {
    describe('find', () => {
      it('returns the first matching result', () => {
        expect(jsonLd.find(PLACE, obj => obj.name === 'Entrance')).toBe(
          PLACE.geo[0]
        );
      });

      it('returns undefined when nothing matches', () => {
        expect(jsonLd.find(PLACE, obj => obj.name === 'foo')).toBe(undefined);
      });
    });

    describe('findAll', () => {
      it('returns all results', () => {
        expect(
          jsonLd.findAll(PLACE, obj => obj['@type'] === 'GeoCoordinates')
        ).toEqual([PLACE.geo[0], PLACE.geo[1]]);
      });

      it('returns an empty array when nothing matches', () => {
        expect(jsonLd.findAll(PLACE, obj => obj['@type'] === 'foo')).toEqual(
          []
        );
      });
    });
  });

  describe('getByType and getAllByType', () => {
    describe('getByType', () => {
      it('returns a single result', () => {
        expect(jsonLd.getByType(PLACE, 'GeoCoordinates')).toBe(PLACE.geo[0]);
      });
    });

    describe('getAllByType', () => {
      it('returns a single result', () => {
        expect(jsonLd.getAllByType(PLACE, 'GeoCoordinates')).toEqual([
          PLACE.geo[0],
          PLACE.geo[1],
        ]);
      });
    });
  });

  describe('isType', () => {
    it('returns a whether the object is of the given type', () => {
      expect(jsonLd.isType(PLACE, 'GeoCoordinates')).toBe(false);
      expect(jsonLd.isType(PLACE, 'Place')).toBe(true);
    });
  });
});
