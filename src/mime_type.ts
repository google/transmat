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

export interface MimeType {
  type: string;
  subtype: string;
  params: Map<string, string>;
}

/** Parses a mime type string into a destructed MimeType object. */
export function parse(input: string): MimeType {
  const [essence, ...paramSets] = input.trim().toLowerCase().split(';');
  const [type, subtype] = essence.split('/');
  if (!type || !subtype) {
    throw new Error('Invalid mime type. Missing type or subtype.');
  }
  const params = new Map();
  for (const p of paramSets) {
    const [key, ...value] = p.split('=');
    params.set(key, value.join('='));
  }
  return {
    type,
    subtype,
    params,
  };
}

/** Match two mimetypes, with the first input as a base. */
export function match(src: MimeType, compare: MimeType): boolean {
  for (const key of [...src.params.keys()]) {
    if (src.params.get(key) !== compare.params.get(key)) {
      return false;
    }
  }
  return src.type === compare.type && src.subtype === compare.subtype;
}
