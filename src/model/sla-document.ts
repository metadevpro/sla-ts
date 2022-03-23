import { ConfigurationObject } from './configuration-object';
import { ContextObject } from './context-object';
import { InfrastructureObject } from './infraestructure-object';
import { MetricDefinition } from './metric-definition';
import { PlanObject } from './plan-object';
import { PricingObject } from './pricing-object';

/** SLA Document
 * Root for an SLA description
 */
export interface SlaDocument {
  context: ContextObject;
  infrastructure?: InfrastructureObject;
  metrics?: { [key: string]: MetricDefinition };
  pricing?: PricingObject;
  /** Time constrains for the API if any */
  availability?: string;
  configuration?: ConfigurationObject;
  plans: { [key: string]: PlanObject };
}
