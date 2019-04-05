const fs = require('fs');
const qoa = require('qoa');
const utils = require('./utils.js');
const chalk = require('chalk');

module.exports = function() {

  // Create info directory if it does not exist
  if ( !fs.existsSync(utils.BCDB_INFO_DIR ) ) {
    console.log(chalk.red('Error: configuration required.'));
    console.log(chalk.red('Run ') + chalk.red.italic('bcdb config') + chalk.red(' to complete configuration.'));
    process.exit(1);
  }


  // Setup prompt data for config
  const setup = [
    {
      type: 'input',
      query: `${chalk.cyan('Pantheon site name:')}`,
      handle: 'pantheon_site'
    },
    {
      type: 'input',
      query: `${chalk.cyan('Local database name:')}`,
      handle: 'db_name'
    },
    {
      type: 'input',
      query: `${chalk.cyan('Local database user ')} (root):`,
      handle: 'db_user'
    },
    {
      type: 'input',
      query: `${chalk.cyan('Local database password')} (root):`,
      handle: 'db_pass'
    },
    {
      type: 'input',
      query: `${chalk.cyan('Local database hostname')} (root):`,
      handle: 'db_host'
    },
    {
      type: 'interactive',
      query: `${chalk.cyan('Select structure')}`,
      handle: 'setup',
      symbol: '>',
      menu: utils.CMS_OPTIONS
    },
  ];

  qoa.prompt(setup)
    .then((response) => {

      let db_user = response.db_user ? response.db_user : 'root';
      let db_pass = response.db_pass ? response.db_pass : 'root';
      let db_host = response.db_host ? response.db_host : 'localhost';

let data = `module.exports = {
  site: '${response.pantheon_site}',
  localDatabase: {
    name: '${response.db_name}',
    user: '${db_user}',
    pass: '${db_pass}',
    host: '${db_host}',
  },
  format: '${response.setup}',
  file_path: '${utils.cmsFilePath(response.setup)}',
}`;

      // Write file with config data
      fs.writeFileSync(utils.BCDB_PROJECT_FILE, data, function(err) {
        if (err) {
          throw Error(err);
        }
      });

      console.log(chalk.green('⚡️ Project config complete!'));

    });
}