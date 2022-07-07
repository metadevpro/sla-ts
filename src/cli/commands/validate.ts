import { Command } from '../command';

import * as colors from '@colors/colors/safe';
import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { SlaValidator } from '../../validator/validator';

export const validateSla = async (cmd: Command): Promise<number> => {
  if (!cmd.inputFile) {
    return 10;
  }
  try {
    const data = readFileSync(cmd.inputFile, { encoding: 'utf8' });
    const trimmed = data.trim() || '';
    const isYaml = trimmed.startsWith('sla:') || trimmed.startsWith('sla4oas:');
    const sla = isYaml ? parseYaml(data) : JSON.parse(data);

    const errors = await SlaValidator.validateDocument(sla);

    errors.map((e) => {
      const msg = `${e.severity} ${e.code}: at ${e.path} ${e.message}`;
      if (e.severity === 'error') {
        console.error(colors.red(msg));
      } else if (e.severity === 'warn' || e.severity === 'deprecated') {
        console.warn(colors.yellow(msg));
      } else if (e.severity === 'info') {
        console.log(colors.white(msg));
      }
    });
    if (errors.length) {
      console.log(`${errors.length} errors found.`);
    } else {
      console.log(colors.green(`Document is valid.`));
    }
    return errors.length > 0 ? 1000 : 0;
  } catch (ex) {
    console.error(colors.red(`Error loading/parsing the SLA: ${ex}`));
    return 100;
  }
};
