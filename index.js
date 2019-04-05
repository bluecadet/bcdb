const chalk = require('chalk');

exports.list_commands = function () {
  console.log('Available Commands:');
  console.log(chalk.green('bcdb pull') + ' pull database or files');
  console.log('');
  console.log(chalk.green('bcdb pull --exclude=[path/to/exclude] ') + ' seperate multiple paths with a comma (,)');
  console.log('');
  console.log(chalk.green('bcdb init  ') + ' initialize a project');
  console.log('');
  console.log(chalk.green('bcdb config') + ' initialize root bcdb settings');
  return;
}
