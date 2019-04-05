const utils = require('./utils.js');
const path = require('path');
const fs = require('fs');
const fsx = require('fs-extra');
const qoa = require('qoa');
const chalk = require('chalk');
const { exec } = require('child_process');
const request = require('request');
const zlib = require("zlib");
const Rsync = require('rsync');
const mysql = require('mysql');
const argv = require('yargs').argv;

let PROJECT_CONFIG;

/**
 * Make a Pantheon DB backup, download it, load it into MAMP
 *
 */
function getPantheonDB(site, cb) {
  const CONNECTION_OPTS = {
    user : PROJECT_CONFIG.localDatabase.user,
    password : PROJECT_CONFIG.localDatabase.pass,
    socketPath : '/Applications/MAMP/tmp/mysql/mysql.sock',
  };
  const SITE_PATH = utils.setupAssetPath(site, 'db');
  const DB_FILE_PATH = SITE_PATH + '/db.sql';

  console.log(chalk.blue(`Creating database backup for ${site}...`));

  exec(`terminus backup:create --element=db  ${site}`, (err, stdout, stderr) => {
    if (err) {
      console.log(chalk.red(`ERROR @ terminus backup:create --element=db  ${site}`));
      throw Error(err);
    }

    exec(`terminus backup:get --element=db  ${site}`, (err, stdout, stderr) => {
      if (err) {
        console.log(chalk.red(`ERROR @ terminus backup:get --element=db  ${site}`));
        throw Error(err);
      }

      console.log(chalk.blue(`...Downloading database backup...`));

      const requestStream = request(stdout)
        .pipe(zlib.createGunzip())
        .pipe(fs.createWriteStream(DB_FILE_PATH));

      requestStream.on('finish', function () {

        console.log(chalk.blue(`...Importing database...`));

        // Connect to mysql, prep DB by dropping and creating
        const CONNECTION = mysql.createConnection(CONNECTION_OPTS);
        CONNECTION.connect();

        // Drop the DB
        CONNECTION.query('DROP DATABASE IF EXISTS `' + PROJECT_CONFIG.localDatabase.name + '`', function (err, results, fields) {
          if (err) {
            console.log(chalk.red(`ERROR @ CONNECTION.query('DROP DATABASE IF EXISTS...`));
            throw err;
          }
        });

        // Create the DB
        CONNECTION.query('CREATE DATABASE `' + PROJECT_CONFIG.localDatabase.name + '`', function (err, results, fields) {
          if (err) {
            console.log(chalk.red(`ERROR @ CONNECTION.query('CREATE DATABASE...`));
            throw Error(err);
          }
        });

        // When complete, import the DB
        CONNECTION.end(function(err) {
          if (err) {
            console.log(chalk.red(`ERROR @ CONNECTION.end`));
            throw Error(err);
          }

          // Import the DB once the connection has ended
          let command = '{executable} -u{username} -p{password} {database} < {file}';

          command = command.replace('{executable}', 'mysql --socket=' + CONNECTION_OPTS.socketPath);
          command = command.replace('{username}', PROJECT_CONFIG.localDatabase.user);
          command = command.replace('{password}', PROJECT_CONFIG.localDatabase.pass);
          command = command.replace('{database}', PROJECT_CONFIG.localDatabase.name);
          command = command.replace('{file}', DB_FILE_PATH);

          exec(command, (err) => {
            if (err) {
              console.log(`Error @ /Applications/MAMP/Library/bin/mysql --user=${PROJECT_CONFIG.localDatabase.user} --password=${PROJECT_CONFIG.localDatabase.pass} ${PROJECT_CONFIG.localDatabase.name} < ${DB_FILE_PATH} > /dev/null 2>&1`)
              throw Error(err);
            } else {
              console.log(chalk.green('✨ Database import complete!'));

              // Callback
              cb();
            }
          });

        }); // end CONNECTION.end...

      }); // end requestStream.on('finish'...

    }); // end exec(`terminus backup:get...

  }); // end exec(`terminus backup:create...
}


const getPantheonFiles = (site, data) => {

  // const creds = JSON.parse(data);
  // const SITE_PATH = utils.setupAssetPath(site, 'files');
  // const FILES_PATH = path.join(utils.BCDB_PROJECT_PATH, PROJECT_CONFIG.file_path);
  const ryscExcludes = ['js', 'css', 'ctools', 'imagecache', 'xmlsitemap', 'backup_migrate', 'php/twig/*', 'styles', 'less'];

  if ( argv.exclude ) {
    let excludes = argv.exclude;

    if (excludes.indexOf(',') > -1) {
      excludes = excludes.split(',');
      excludes.forEach( (x) => {
        ryscExcludes.push(x);
      });
    } else {
      ryscExcludes.push(excludes);
    }
  }

  let rsync = new Rsync()
    .flags('r', 'v', 'l', 'z')
    .chmod('u=rwx,g=rx,o=rx')
    .set('copy-unsafe-links')
    .set('size-only')
    .set('ipv4')
    .progress()
    .exclude(ryscExcludes)
    .shell('ssh -p 2222')
    .source(`${creds.sftp_username}@${creds.sftp_host}:files`)
    .destination(SITE_PATH);

    console.log(chalk.blue(`...Syncing files...`));

    rsync.execute(function(err) {
      if (err) {
        console.log(chalk.red('Error @ rsync'));
        throw Error(err);
      }

      // Copy all that jazz
      console.log(chalk.blue(`...Moving files into place...`));
      fsx.emptyDirSync(FILES_PATH);
      fsx.copySync(`${SITE_PATH}/files`, FILES_PATH, { overwrite: true });
      fsx.emptyDirSync(SITE_PATH);

      console.log(chalk.green('💫 File import complete!'));

    }, function(data) {
      var out = data.toString('utf-8').split(/\r?\n/);
      out.forEach(str => {
        if ( str.startsWith('files/') ) {
          console.log(str);
        }
      });
    });

}



/**
 * Default pull function
 *
 */
module.exports = () => {

  // If no config file, bail
  if ( !fs.existsSync(utils.BCDB_INFO_DIR ) ) {
    console.log(chalk.red('Error: configuration required.'));
    console.log(chalk.red('Run ') + chalk.red.italic('bcdb-node config') + chalk.red(' to complete configuration.'));
    process.exit(1);
  }

  // If no init file, bail
  if ( !fs.existsSync(utils.BCDB_PROJECT_FILE) ) {
    console.log(chalk.red(`Error: ${path.dirname(utils.BCDB_PROJECT_FILE)}/${path.basename(utils.BCDB_PROJECT_FILE)} does not exist`));
    console.log(chalk.red('Run ') + chalk.red.italic('bcdb-node init') + chalk.red(' to complete project setup.'));
    process.exit(1);
  }

  PROJECT_CONFIG = require(utils.BCDB_PROJECT_FILE);

  // Callback for listing Pantheon Envs
  const PULL_CONFIG = (ENV_LIST) => {
    const call = [
      {
        type: 'interactive',
        query: `${chalk.cyan('Select environment to pull from')}`,
        handle: 'env',
        symbol: '>',
        menu: ENV_LIST
      },
      {
        type: 'confirm',
        query: `${chalk.cyan('Pull Database?')}`,
        handle: 'pull_db',
        accept: 'y',
        deny: 'n'
      },
      {
        type: 'confirm',
        query: `${chalk.cyan('Pull Files?')}`,
        handle: 'pull_files',
        accept: 'y',
        deny: 'n'
      }
    ];

    qoa.prompt(call)
      .then((response) => {
        const site = `${PROJECT_CONFIG.site}.${response.env}`;

        if ( response.pull_db ) {
          getPantheonDB(site, function() {
            if ( response.pull_files ) {
              utils.getPantheonConnectionData(site, getPantheonFiles);
            }
          });

        } else {

          if ( response.pull_files ) {
            utils.getPantheonConnectionData(site, getPantheonFiles);
          }
        }
      });
  };

  utils.getPantheonEnvsArray(PROJECT_CONFIG.site, PULL_CONFIG);

}