var program = require('commander');

program
  .version('0.0.1')
  .command("echo <value>", "Echo back whatever value is passed.")
  .command("component <name>", "Creates an Angular component.")
  .command("factory <name>", "Creates an Angular factory.")
  .command("service <name>", "Creates an Angular service.")
  .parse(process.argv);
  