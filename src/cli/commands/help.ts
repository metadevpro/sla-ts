export const help = (): number => {
  console.log('  Supported commands:');
  console.log(
    '     [v]alidate <sla_file>                 Validates a sla document (as JSON or YAML).'
  );
  console.log('     [d]ocument <sla_file> <output_file>   Generate html documentation for SLA.');
  console.log('     [h]elp                                Print help.');
  console.log('     <no command>                          Help also.');
  return 0;
};
