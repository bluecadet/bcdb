const fs = require('fs');
const qoa = require('qoa');
const utils = require('./utils.js');
const fsx = require('fs-extra');
const chalk = require('chalk');

module.exports = function() {

  // Create info directory if it does not exist
  fsx.ensureDir(utils.BCDB_INFO_DIR, err => {
    if (err) {
      throw Error(err);
    }

  // fs.stat(utils.BCDB_INFO_DIR, function(err) {
  //   if (err) {
  //     mkdirp(utils.BCDB_INFO_DIR, function (err) {
  //       if (err) {
  //         console.error(err);
  //       } else {

  //       }
  //     });
  //   }

    // fs.writeSync(utils.BCDB_INFO_FILE, '', function(err) {
    //   if (err) throw err;
    // });

    // Setup prompt data for config
    const configPrompt = [
      {
        type: 'input',
        query: 'Pantheon Machine Token:',
        handle: 'pantheon_machine_token'
      },
      // {
      //   type: 'input',
      //   query: 'Pantheon Password:',
      //   handle: 'pantheon_machine_token'
      // },
    ];

    // Prompt for config data, then write it to yml
    qoa.prompt(configPrompt).then(
      (response) => {

let data = `module.exports = {
  pantheon_machine_token: '${response.pantheon_machine_token}',
}`;

        fs.writeFileSync(utils.BCDB_INFO_FILE, data, function(err) {
          if (err) {
            throw Error(err);
          } else {
            console.log(chalk.green('⚡️ Project config complete!'));
          }
        });
      }
    );

  });

};