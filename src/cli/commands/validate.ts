import { Command } from '../command';

import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { SlaValidator } from '../../validator/validator';

export const validateSla = async (cmd: Command): Promise<number> => {
  if (!cmd.inputFile) {
    return 10;
  }
  try {
    const data = readFileSync(cmd.inputFile, { encoding: 'utf8' });
    const isYaml = data.trim().startsWith('sla:');
    const sla = isYaml ? parseYaml(data) : JSON.parse(data);

    const errors = await SlaValidator.validateDocument(sla);

    errors.map((e) => {
      const msg = `${e.severity} ${e.code}: at ${e.path} ${e.message}`;
      if (e.severity === 'error') {
        console.error(msg);
      } else if (e.severity === 'warn' || e.severity === 'deprecated') {
        console.warn(msg);
      } else if (e.severity === 'info') {
        console.log(msg);
      }
    });
    if (errors.length) {
      console.log(`${errors.length} errors found.`);
    }
    return errors.length > 0 ? 1000 : 0;
  } catch (ex) {
    console.error(`Error loading/parsing the SLA: ${ex}`);
    return 100;
  }
};
