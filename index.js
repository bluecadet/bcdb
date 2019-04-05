const chalk = require('chalk');

exports.list_commands = function () {
  console.log('Available Commands:');
  console.log(chalk.green('bcdb-node pull  ') + ' pull database or files');
  console.log(chalk.green('bcdb-node init  ') + ' initialize a project');
  console.log(chalk.green('bcdb-node config') + ' initialize root bcdb settings');
  return;
}
