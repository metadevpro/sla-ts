import * as colors from '@colors/colors/safe';
import { readFileSync, writeFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { slaToHtml } from '../../generator/sla-html-generator';
import { SlaDocument } from '../../model';
import { Command } from '../command';

export const documentSla = (cmd: Command): number => {
  try {
    const inputFile = cmd.inputFile || 'file.json';
    const data = readFileSync(inputFile, { encoding: 'utf8' });
    const trimmed = data.trim() || '';
    const isYaml = trimmed.startsWith('sla:') || trimmed.startsWith('sla4oas:');
    const sla: SlaDocument = isYaml ? parseYaml(data) : JSON.parse(data);

    const cssUri = cmd.style !== 'swagger-ui' ? '../css/sla.css' : '../css/swagger-ui.css';

    const html = slaToHtml(sla, cssUri);

    const filename = cmd.outputFile || 'file.html';
    writeFileSync(filename, html);
    console.log(colors.green(`Generated document file at: ${filename}`));
    return 0;
  } catch (ex) {
    console.error(colors.red(`Error loading/parsing the SLA: ${ex}`));
    return 100;
  }
};
