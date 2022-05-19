/** sla-cli
 *
 * Client Line Interface tooling for SLAs
 */

import * as colors from '@colors/colors/safe';
import { exit } from 'process';
import { parseArguments, validateCommand } from './arg-parse';
import { CommandType } from './command';
import { documentSla } from './commands/document';
import { help } from './commands/help';
import { validateSla } from './commands/validate';

const VERSION = '0.0.1';

const main = async (argv: string[]): Promise<number> => {
  hello();
  argv.shift();
  argv.shift();

  const cmd = parseArguments(argv);
  const errors = validateCommand(cmd);
  if (errors !== 0) {
    return errors;
  }

  switch (cmd.type) {
    case CommandType.Validate:
      return await validateSla(cmd);
    case CommandType.Document:
      return documentSla(cmd);
    case CommandType.Help:
    default:
      return help();
  }
};

const hello = (): void => {
  console.log(colors.green('sla-cli') + colors.yellow(` v: ${VERSION}`));
};

// Execute
main(process.argv)
  .then((errno) => exit(errno))
  .catch((err) => {
    console.error(err);
    exit(2000);
  });
