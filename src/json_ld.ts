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
import {APPLICATION_LD_JSON} from './mime_type';
import {TransmatTransfer} from './transmat_transfer';

/** Returns a parameterized mime type containing the root JSON-LD type. */
export function getMimeType(identifier?: string) {
  return identifier
    ? `${APPLICATION_LD_JSON};identifier=${identifier}`.toLowerCase()
    : APPLICATION_LD_JSON;
}

/**
 * Returns whether the transfer contains JSON-LD, optionally restricted to a
 * specific type parameter.
 */
export function hasType(
  transfer: TransmatTransfer,
  identifier?: string
): boolean {
  return transfer.hasType(getMimeType(identifier));
}

/** Returns the JSON-LD data parsed into an object. */
export function getData<T extends Thing>(
  transfer: TransmatTransfer,
  identifier?: string
): WithContext<T> | undefined {
  const data = transfer.getData(getMimeType(identifier));
  return data ? (JSON.parse(data) as WithContext<T>) : undefined;
}

/**
 * Sets the given object as JsonLdData, and returns the generated entry. By
 * default, the data will be marked as a https://schema.org/Thing.
 */
export function setData<T extends Thing>(
  transfer: TransmatTransfer,
  data: Partial<WithContext<T>>,
  identifier?: string
): {type: string; data: WithContext<T>} {
  const jsonLd = Object.assign(
    {
      // By default, map data against a https://schema.org/Thing.
      '@context': 'https://schema.org',
      '@type': 'Thing',
    },
    data
  ) as WithContext<T>;
  const type = getMimeType(identifier);
  transfer.setData(type, jsonLd);
  return {type, data: jsonLd};
}
