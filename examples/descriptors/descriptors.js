const { Vorpal } = require('../../dist/vorpal')
var vorpal = new Vorpal()

vorpal
  .title('Vorpal')
  .version('1.4.0')
  .description('Conquer the command-line.')
  .banner(`              (O)
              <M
   o          <M
  /| ......  /:M\\------------------------------------------------,,,,,,
(O)[ vorpal ]::@+}==========================================------------>
  \\| ^^^^^^  \\:W/------------------------------------------------''''''
   o          <W
              <W
              (O)`);

vorpal.command('build', 'Build the application.')
  .option('-d')
  .option('-a')
  .action(function (args, cb) {
    this.log(args);
    cb();
  });

vorpal.command('clean', 'Clean the local workspace.')
  .option('-f')
  .action(function (args, cb) {
    this.log(args);
    cb();
  });

vorpal.command('compress', 'Compress assets.')
  .option('-gzip')
  .action(function (args, cb) {
    this.log(args);
    cb();
  });

vorpal
  .default('', 'Displays the index view.')
  .action(function (args, cb) {
    this.log(this.parent._commandHelp(args.command));
    cb();
  });

vorpal.exec('help')
