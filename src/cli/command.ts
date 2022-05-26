export interface Command {
  type: CommandType;
  inputFile?: string;
  outputFile?: string;
  style?: string;
}
export enum CommandType {
  Help = 'help',
  Validate = 'validate',
  Document = 'document'
}
