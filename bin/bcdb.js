#!/usr/bin/env node

const index = require('../index.js');
const config = require('../lib/config.js');
const init = require('../lib/init.js');
const pull = require('../lib/pull.js');
const argvs = process.argv.slice(2);

if ( argvs.length > 0 ) {

  if ( argvs.includes('config') ) {
    config();
  } else if ( argvs.includes('init') ) {
    init();
  } else if ( argvs.includes('pull') ) {
    pull();
  } else {
    index.list_commands();
  }

} else {
  index.list_commands();
}

