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

import {Thing, WithContext, DataType, PronounceableText} from 'schema-dts';

export type SchemaValue<T> = T | ReadonlyArray<T>;
export type ScalarDataType = string | number | boolean | null;

// Same as WithContext, adds a @type key typing to the object.
export declare type WithType<T> = T & {'@type': SchemaValue<string>};

/** Mime type for JSON-LD data. */
export const MIME_TYPE = 'application/ld+json';

/** Parses the input to an object. */
export function parse<T extends Thing>(
  data: string
): WithContext<T> | undefined {
  return JSON.parse(data, (key, value) => {
    switch (value) {
      case 'True':
      case 'https://schema.org/True':
        return true;

      case 'False':
      case 'https://schema.org/False':
        return false;

      default:
        return value;
    }
  }) as WithContext<T>;
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
      '@context': 'https://schema.org',
      '@type': 'Thing',
    },
    data
  ) as WithContext<T>;
}

/**
 * Get the scalar value from a JSON-LD object property. In case the input is an
 * array, the first item will be used.
 */
export function getValue(
  input: SchemaValue<DataType> | undefined
): ScalarDataType | undefined {
  const value = Array.isArray(input) ? input[0] : input;
  const pronounceableText = findOneOfType<Exclude<PronounceableText, string>>(
    value,
    'PronounceableText'
  );
  if (pronounceableText && pronounceableText.textValue) {
    return getValue(pronounceableText.textValue);
  }
  return value;
}

/** Get scalar values as an array. */
export function getValues(
  input: SchemaValue<DataType>
): ReadonlyArray<ScalarDataType> {
  const inputArray = Array.isArray(input) ? input : [input];
  const results = [];
  for (const v of inputArray) {
    const scalar = getValue(v);
    if (scalar !== undefined) {
      results.push(scalar);
    }
  }
  return results;
}

/** Traverse an object multiple values. */
export function findAll<T>(
  data: {},
  matcher: (node: T | unknown) => boolean,
  limit = 0,
  results: T[] = []
): ReadonlyArray<T> {
  if (!data || (limit && results.length === limit)) {
    return results;
  }
  if (matcher(data)) {
    results.push(data as T);
  }
  for (const value of Object.values(data)) {
    if (isObject(value)) {
      findAll(value, matcher, limit, results);
    }
  }
  return results;
}

/** Find a single value. */
export function findOne<T>(
  data: {},
  matcher: (node: T | unknown) => boolean
): T | undefined {
  return findAll<T>(data, matcher, 1)[0];
}

export function findAllOfType<T>(
  data: {},
  type: string,
  limit = 0
): ReadonlyArray<T> {
  return findAll<T>(data, obj => isType(obj, type), limit);
}

export function findOneOfType<T>(data: {}, type: string): T | undefined {
  return findAllOfType<T>(data, type, 1)[0];
}

/** Whether the input object is of the given type. */
export function isType<T>(obj: T | unknown, type: string): obj is WithType<T> {
  if (!isObject(obj)) {
    return false;
  }
  const objType = (obj as WithType<T>)['@type'];
  return Array.isArray(objType) ? objType.includes(type) : objType === type;
}

/** Whether the input is a non-null object.  */
function isObject(input: {} | unknown): input is {} {
  return input !== null && typeof input === 'object';
}
