import * as colors from '@colors/colors/safe';

export const help = (): number => {
  console.log(colors.yellow('  Supported commands:'));
  console.log(
    colors.white(
      '     [v]alidate <sla_file>                 Validates a sla document (as JSON or YAML).'
    )
  );
  console.log(
    colors.white('     [d]ocument <sla_file> <output_file>   Generate html documentation for SLA.')
  );
  console.log(colors.white('     [h]elp                                Print help.'));
  console.log(colors.white('     <no command>                          Help also.'));
  return 0;
};
