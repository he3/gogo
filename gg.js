var program = require('commander');

program
  .version('0.0.1')
  .command("echo <value>", "Echo back whatever value is passed.")
  .command("component <name>", "Example of code generation. Creates an Angular component.")
  .parse(process.argv);
  