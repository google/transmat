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

import {GeoCoordinates, Place} from 'schema-dts';
import {Transmat, addListeners} from '../src';
import * as jsonLd from '../src/json_ld';

const container = document.querySelector<HTMLElement>('.map')!;

// Simple LeafLet instance.
const L = window.L;
const map = L.map(container, {
  center: [47.3769, 8.5417],
  zoom: 14,
});

const geoJsonLayer = L.layerGroup([]).addTo(map);

// Setup Leaflet tiles using OpenStreetMap to avoid dealing with API keys.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const GEO_JSON_MIME_TYPE = 'application/geo+json';

// Receive at the map.
addListeners(container, 'receive', event => {
  const transfer = new Transmat(event);
  const hasJsonLd = transfer.hasType(jsonLd.MIME_TYPE);
  const hasGeoJson = transfer.hasType(GEO_JSON_MIME_TYPE);

  if ((hasJsonLd || hasGeoJson) && transfer.accept()) {
    if (hasGeoJson) {
      // Simply arse the receiving Geo JSON data and send to Leaflet.
      const geoJson = JSON.parse(transfer.getData(GEO_JSON_MIME_TYPE)!);
      addGeoJson(geoJson);
      return;
    }

    if (hasJsonLd) {
      const data = jsonLd.parse(transfer.getData(jsonLd.MIME_TYPE)!);
      const features = jsonLd
        // Find all GeoCoordinates in the JSON-LD payload.
        .getAllByType<GeoCoordinates>(data, 'GeoCoordinates')
        .filter(gc => gc.latitude && gc.longitude)
        // Map the GeoCoordinates to a GeoJson feature.
        .map(gc => {
          return {
            type: 'Feature',
            properties: {
              name: jsonLd.getValue(gc.name),
              popupContent: jsonLd.getValue(gc.name || gc.description),
            },
            geometry: {
              type: 'Point',
              coordinates: [gc.longitude, gc.latitude],
            },
          };
        });
      addGeoJson((features as unknown) as GeoJSON.GeoJSON);
    }
  }
});

function addGeoJson(data: GeoJSON.GeoJSON) {
  // For debugging purposes.
  console.log('displaying GeoJSON', data);

  geoJsonLayer.clearLayers();
  const feature = L.geoJSON(data).addTo(geoJsonLayer);
  map.fitBounds(feature.getBounds());
}

// Example transmit sources.

addListeners(
  document.querySelector('.sources .json-ld')!,
  'transmit',
  event => {
    const transfer = new Transmat(event);
    const data = jsonLd.fromObject<Place>({
      '@type': 'Place',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 40.74836,
        longitude: -73.98565,
      },
      name: 'Empire State Building',
    });
    transfer.setData(jsonLd.MIME_TYPE, data);
  }
);

addListeners(
  document.querySelector('.sources .geo-json')!,
  'transmit',
  event => {
    const transfer = new Transmat(event);
    transfer.setData(GEO_JSON_MIME_TYPE, {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [5.89287, 51.96275],
      },
    });
  }
);
