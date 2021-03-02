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

import {Thing, WithContext} from 'schema-dts';

/** Mime type for JSON-LD data. */
export const MIME_TYPE = 'application/ld+json';

/** Parses the input to an object. */
export function parse<T extends Thing>(
  data: string
): WithContext<T> | undefined {
  return JSON.parse(data) as WithContext<T>;
}

/**
 * Sets the given object as JsonLdData, and returns the generated entry. By
 * default, the data will be marked as a https://schema.org/Thing.
 */
export function fromObject<T extends Thing>(
  data: Partial<WithContext<T>>
): WithContext<T> {
  return Object.assign(
    {
      // By default, map data against a https://schema.org/Thing.
      '@context': 'https://schema.org',
      '@type': 'Thing',
    },
    data
  ) as WithContext<T>;
}
