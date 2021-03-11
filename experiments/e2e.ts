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

import {Person, School} from 'schema-dts';
import {Transmat, TransmatObserver, addListeners} from '../src';
import * as jsonLd from '../src/json_ld';

const transmitEl = document.querySelector<HTMLElement>('.transmitter')!;
const receiveEl = document.querySelector<HTMLElement>('.receiver')!;

addListeners(transmitEl, 'transmit', event => {
  const transfer = new Transmat(event);
  const data = jsonLd.fromObject<Person>({
    '@type': 'Person',
    name: 'Rory Gilmore',
    affiliation: {
      '@type': 'School',
      name: 'Yale',
    },
  });
  transfer.setData(jsonLd.MIME_TYPE, data);
});

addListeners(receiveEl, 'receive', (event, target) => {
  const transfer = new Transmat(event);
  if (transfer.hasType(jsonLd.MIME_TYPE) && transfer.accept()) {
    const person = jsonLd.parse<Person>(transfer.getData(jsonLd.MIME_TYPE)!);
    const school = jsonLd.getByType<School>(person, 'School')!;
    const message = `Hi ${person.name} from ${jsonLd.getValue(school.name)}`;
    target.innerText = message;
  }
});

const obs = new TransmatObserver(entries => {
  for (const entry of entries) {
    entry.target.classList.toggle('transmat-over', entry.isTarget);
    entry.target.classList.toggle('transmat-active', entry.isActive);
  }
});
obs.observe(receiveEl);
