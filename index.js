const chalk = require('chalk');

exports.list_commands = function () {
  console.log('Available Commands:');
  console.log(chalk.green('bcdb pull') + ' pull database or files');
  console.log('');
  console.log(chalk.green('bcdb pull --exclude=[path/to/exclude] --force -f'));
  console.log(chalk.blue('--force') + ' or ' + chalk.blue('-f') + ': force a new database backup to be created');
  console.log(chalk.blue('--exclude=[path/to/exclude]') + ': seperate multiple paths with a comma (,)');
  console.log('');
  console.log(chalk.green('bcdb init  ') + ' initialize a project');
  console.log('');
  console.log(chalk.green('bcdb config') + ' initialize root bcdb settings');
  return;
}
