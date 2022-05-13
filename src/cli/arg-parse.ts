import { existsSync } from 'fs';
import { Command, CommandType } from './command';

export const parseArguments = (argv: string[]): Command => {
  if (argv.length === 0) {
    return {
      type: CommandType.Help
    };
  }
  let cmd: Command = { type: CommandType.Help };
  const vType = argv[0].toLowerCase();
  if (['h', 'help'].includes(vType)) {
    cmd = {
      type: CommandType.Help
    };
  } else if (['v', 'val', 'validate'].includes(vType)) {
    cmd = {
      type: CommandType.Validate
    };
  } else if (['d', 'doc', 'document'].includes(vType)) {
    cmd = {
      type: CommandType.Document
    };
  }

  if (argv.length > 1) {
    cmd.inputFile = argv[1];
  }
  if (argv.length > 2) {
    cmd.outputFile = argv[2];
  }
  return cmd;
};

export const validateCommand = (cmd: Command): number => {
  if (cmd.inputFile && !existsSync(cmd.inputFile)) {
    // file does not exists
    console.error(`Error: Provided input file: '${cmd.inputFile}' does not exists.`);
    return 1;
  }
  if (cmd.type === CommandType.Validate && !cmd.inputFile) {
    console.error(`Error: Missing input file for validation.`);
    return 2;
  }
  if (cmd.type === CommandType.Document && !cmd.inputFile) {
    console.error(`Error: Missing input file for validation.`);
    return 3;
  }
  if (cmd.type === CommandType.Document && !cmd.outputFile) {
    console.error(`Error: Missing output file for validation.`);
    return 4;
  }
  return 0;
};
