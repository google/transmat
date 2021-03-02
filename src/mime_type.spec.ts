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

import {parse, match} from './mime_type';

describe('mimeType', () => {
  describe('parse', () => {
    it('supports simple mime-types', () => {
      expect(parse('Text/HTML')).toEqual({
        type: 'text',
        subtype: 'html',
        params: new Map(),
      });
    });

    it('supports mime-types with a suffix', () => {
      expect(parse('application/ld+json')).toEqual({
        type: 'application',
        subtype: 'ld+json',
        params: new Map(),
      });
    });

    it('supports mime-types with path and suffix', () => {
      expect(parse('application/x.foo.bar+json')).toEqual({
        type: 'application',
        subtype: 'x.foo.bar+json',
        params: new Map(),
      });
    });

    it('supports mime-type parameters', () => {
      expect(parse('application/x.foo.bar+json;foo=bar;baz=A=B=C')).toEqual({
        type: 'application',
        subtype: 'x.foo.bar+json',
        params: new Map([
          ['foo', 'bar'],
          ['baz', 'a=b=c'],
        ]),
      });
    });

    it('throws when the mime-type is invalid', () => {
      expect(() => parse('foo')).toThrow();
      expect(() => parse('foo/')).toThrow();
      expect(() => parse('/bar')).toThrow();
      expect(() => parse('/')).toThrow();
      expect(() => parse('')).toThrow();
    });
  });

  describe('match', () => {
    it('returns true when mime-types are equal', () => {
      const a = parse('text/html');
      const b = parse('text/html');
      expect(match(a, b)).toBeTrue();
    });

    it('returns true when the all the params from the input match', () => {
      const a = parse('text/html;foo=bar');
      const b = parse('text/html;foo=bar;baz=a');
      expect(match(a, a)).toBeTrue();
      expect(match(a, b)).toBeTrue();
      expect(match(b, a)).toBeFalse();
    });
  });
});
