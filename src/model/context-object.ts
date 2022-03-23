/** Context Object.
 * Header metadata information about an SLA.
 */
export interface ContextObject {
  id: string;
  sla: string;
  type: 'plans';
  /** URL to the OpenAPI contract */
  api: string;
  /** The organization providing this API */
  provider?: string;
}
