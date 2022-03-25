export interface ValidationError {
  severity: 'error' | 'warn' | 'info' | 'deprecated';
  code: string;
  message: string;
  found?: string;
  expected?: string;
  path?: string;
}
