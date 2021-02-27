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

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    files: [{pattern: 'src/**/*.ts'}],
    preprocessors: {
      'src/**/*.ts': ['karma-typescript'],
    },

    karmaTypescriptConfig: {
      compilerOptions: {
        rootDir: 'src/',
        downlevelIteration: true,
      },
      exclude: ['./experiments'],
    },

    summaryReporter: {
      // 'failed', 'skipped' or 'all'
      show: 'all',
      // Limit the spec label to this length
      specLength: 80,
      // Show an 'all' column as a summary
      overviewColumn: false,
      // Show a list of test clients, 'always', 'never' or 'ifneeded'
      browserList: 'ifneeded',
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['karma-typescript', 'progress'],

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: !process.env.CI,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: !!process.env.CI,
  });
};
