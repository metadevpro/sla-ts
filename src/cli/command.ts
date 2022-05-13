export interface Command {
  type: CommandType;
  inputFile?: string;
  outputFile?: string;
}
export enum CommandType {
  Help = 'help',
  Validate = 'validate',
  Document = 'document'
}
