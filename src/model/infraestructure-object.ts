/** Infrastructure object
 * Related tooling used to supervise and/or track the SLA.
 */
export interface InfrastructureObject {
  /** URL of the supervisor */
  supervisor?: string;
  /** URL of the monitor */
  monitor?: string;
}
