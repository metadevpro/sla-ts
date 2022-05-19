/** SLA Document
 * Root for an SLA4OAI description. 1.0.0 Draft
 * Conforms to the schema: https://github.com/isa-group/SLA4OAI-Specification/blob/main/versions/1.0.0-Draft.md
 */
export interface SlaDocument {
  /** Required. Identifies the version of the SLA4OAI used. */
  sla: string;
  /** Required. Identifies the version of the SLA4OAI used. */
  context: ContextObject;
  /** Required. A list of metrics to use in the context of the SLA. */
  metrics: { [metricName: string]: MetricObject | UrlReference };
  /** Required when context.type=plans A set of plans to define different service levels per plan */
  plans?: { [planName: string]: PlanObject };
  /** Required when context.type=agreement A set of plans to define different service levels per plan */
  terms?: PlanObject;
}

export interface ContextObject {
  /** Required The identification of the SLA context. */
  id: string;
  /** Required: Agreement or plan */
  type: 'plans' | 'agreement';
  /** Optional Indicates a URI (absolute or relative) describing the API, described in the OpenAPI format, to be instrumented. If unspecified, the associated API is the one defined by the referring OpenAPI specification main document. */
  api?: UrlReference;
  /** Optional Provider information: data about the owner/host of the API. This field is required in case of the context type is instance. */
  provider?: string;
  /** Optional Time frame for the SLA Contract */
  availability?: ContractAvailability;
  /** Optional Api Keys */
  apikeys?: string[];
}

export interface ContractAvailability {
  /** Optional When the contract starts its validity. */
  from?: string;
  /** Optional When the contract ends its validity. */
  to?: string;
}

/** External reference */
export interface UrlReference {
  $ref: string;
}

export interface MetricObject {
  /** Required This is the metric type accordingly to the OAI spec defined types.
   * Types from https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.2.md#dataTypes */
  type: 'integer' | 'number' | 'string' | 'boolean';
  /** Optional The extending format for the previously mentioned type. See Data Type Formats for further details.
   * Formats from https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.2.md#dataTypes */
  format?: 'int32' | 'int64' | 'float' | 'double' | 'byte' | 'date' | 'date-time' | string;
  /** Optional A brief description of the metric. */
  description?: string;
}

/** Describes a usage plan for the API with its associate costs, availability and guarantees. */
export interface PlanObject {
  /** Optional Original plan name (used for agreements)  */
  plan?: string;
  /**	Optional Availability of the service for this plan expressed via time slots using the ISO 8601 time intervals format. */
  availability?: string;
  /** Optional Specific pricing data for this plan. Overrides default pricing data defined before. */
  pricing?: PricingObject;
  /** Optional Specific quotas data for this plan. Overrides default quotas data defined before. */
  quotas?: QuotasObject;
  /** Optional Specific rates data for this plan. Overrides default rates data defined before. */
  rates?: RatesObject;
}

/** Describes the general information of the pricing of the a given plan. */
export interface PricingObject {
  /** Optional Units of cost associated with this service. Defaults to 0 if unspecified. */
  cost?: number;
  /** Optional Currency used to express the cost. Supported currency values are expressed in ISO 4217 format. Samples: USD, EUR, or BTC for US dollar, euro, or bitcoin, respectively. Defaults to USD if unspecified. */
  currency?: string;
  /** 	Optional Billing frequency. Possible values are: onepay, an unique payment before start using the service; daily , billed every day; weekly, billed every week; monthly, billed every month; quarterly, billed every quarter; yearly, billed every year. If it is not specified, the default value assumed is monthly */
  billing?: 'onepay' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}
export interface QuotasObject {
  [path: string]: PathObject;
}
export interface RatesObject {
  [path: string]: PathObject;
}
export interface PathObject {
  [method: string]: OperationObject;
}
export interface OperationObject {
  [metric: string]: LimitObject;
}
export interface LimitObject {
  /** Required Maximum value that can be reached so the limit is not violated. */
  max: number;
  /** Optional The period specified for the given limit; it should be one of the following possible values: second, minute, hour, day, month or year. In case it is not specified, it would be a permanent limit over the metric. */
  period: TimePeriod;
}

export type BillingFrequency = 'onepay' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type TimePeriod = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
