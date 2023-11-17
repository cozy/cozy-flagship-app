/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
'use strict';

// -- Added by Cozy --
// This code is taken from react-16-node-hanging-test-fix package
// which has an error in the semver version check
// -- Added by Cozy --

// See https://github.com/facebook/react/issues/20756
// This fix is only useful in a test environment with
// Node 15+, jsdom, and React < 17.1.0.

// It must be imported *before* any imports of 'react-dom'.

const version = require('react').version;
const semverGt = require('semver/functions/gt');

if (Object.prototype.toString.call(process) !== '[object process]') {
  throw Error(
    'The `react-16-node-hanging-test-fix` package must only be used in a Node environment. ' +
    'Remove this import from your application code.'
  );
}

if (semverGt(version, '18.0.0')) {
  console.error(
    'The `react-16-node-hanging-test-fix` package is no longer needed ' +
    'with React ' + version + ' and may cause issues. Remove this import.'
  )
}

// This is the "fix".
delete global.MessageChannel;
