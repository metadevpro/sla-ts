/** Metric Definition */
export interface MetricDefinition {
  /** Type of the metric */
  type: 'integer' | 'string';
  format: 'int64' | 'string' | undefined;
  description: string;
  resoution: 'consumption';
}
