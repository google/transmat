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

import {Person} from 'schema-dts';
import {TransmatTransfer, TransmatObserver} from '../src';
import * as jsonLd from '../src/json_ld';

const transmitEl = document.querySelector('#transmitter');
const receiveEl = document.querySelector('#receiver');

TransmatTransfer.addTransmitListeners(transmitEl, event => {
  const transfer = new TransmatTransfer(event);
  const jsonLdData = jsonLd.fromObject<Person>({
    '@type': 'Person',
    name: 'Rory',
    affiliation: {
      '@type': 'School',
      name: 'Yale',
    },
  });
  transfer.setData(jsonLd.MIME_TYPE, jsonLdData);
});

TransmatTransfer.addReceiveListeners(receiveEl, event => {
  const transfer = new TransmatTransfer(event);
  if (transfer.hasType(jsonLd.MIME_TYPE) && transfer.acceptTransfer()) {
    const payload = jsonLd.parse<Person>(transfer.getData(jsonLd.MIME_TYPE));

    const message = `Hi ${payload['name']} from ${payload['affiliation']['name']}!`;
    (event.target as HTMLElement).innerText = message;
  }
});

const obs = new TransmatObserver(entries => {
  for (const entry of entries) {
    entry.target.classList.toggle('drag-over', entry.dragover);
    entry.target.classList.toggle('drag-active', entry.active);
  }
});
obs.observe(receiveEl);
