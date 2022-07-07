import { parse as parseYaml } from 'yaml';
import {
  ContextObject,
  LimitObject,
  MetricObject,
  OperationObject,
  PathObject,
  PlanObject,
  PricingObject,
  QuotasObject,
  RatesObject,
  SlaDocument,
  UrlReference
} from '../model';
import { ValidationError } from './validation-error';

/** Validates an SLA Document */
export class SlaValidator {
  static async validateDocument(doc: SlaDocument): Promise<ValidationError[]> {
    const validator = new SlaValidator(doc);
    return await validator.validate();
  }

  static async validateYamlDocument(yamlDoc: string): Promise<ValidationError[]> {
    const sla = parseYaml(yamlDoc);
    const validator = new SlaValidator(sla);
    return await validator.validate();
  }

  version = '';
  errors: ValidationError[] = [];

  constructor(private doc: SlaDocument) {}
  async validate(): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    this.version = this.doc.sla4oas;
    checkPropertyRequired(errors, this.doc, 'sla4oas', '');
    checkSlaVersion(errors, this.doc.sla4oas);
    checkPropertyRequired(errors, this.doc, 'context', '');
    checkPropertyRequired(errors, this.doc, 'metrics', '');

    checkContext(errors, this.doc.context);
    checkPropertyDocumentType(errors, this.doc);

    checkMetrics(errors, this.doc.metrics);
    checkPlans(errors, this.doc.plans); // if type=plans
    // todo: plan (if type=agreement)

    this.errors = errors;
    return errors;
  }
}

const checkContext = (errors: ValidationError[], ctx: ContextObject): void => {
  checkPropertyRequired(errors, ctx, 'id', 'context.id');
  checkPropertyRequired(errors, ctx, 'type', 'context.type', ['plans', 'agreement']);

  if (ctx.api) {
    checkHasUrlReference(errors, ctx.api, 'context.api');
  }
  if (ctx.validity) {
    if (ctx.validity.from) {
      checkValueIsValidDate(errors, ctx.validity.from, 'context.validity.from');
    }
    if (ctx.validity.to) {
      checkValueIsValidDate(errors, ctx.validity.to, 'context.validity.to');
    }
  }
};
const checkMetrics = (
  errors: ValidationError[],
  metrics: { [metricName: string]: MetricObject | UrlReference }
): void => {
  Object.keys(metrics).forEach((name) => {
    const metric = metrics[name];
    if (!metric) {
      checkPropertyRequired(errors, metrics, name, 'metrics.');
    } else if (metric['$ref']) {
      checkMetricReference(errors, metric as UrlReference, `metrics['${name}']`);
    } else {
      checkMetricDefinition(errors, metric as MetricObject, `metrics['${name}']`);
    }
  });
};
const checkPlans = (
  errors: ValidationError[],
  plans: undefined | { [planName: string]: PlanObject }
): void => {
  if (!plans) {
    return;
  }
  Object.keys(plans).forEach((planName) => {
    const plan = plans[planName];
    if (plan) {
      checkPlan(errors, plan, `plans.${planName}`);
    }
  });
};

const checkPlan = (errors: ValidationError[], plan: PlanObject, path: string): void => {
  checkAvailability(errors, plan.availability, path);
  checkPricing(errors, plan.pricing, path);
  checkQuotas(errors, plan.quotas, path);
  checkRates(errors, plan.rates, path);
};

const checkAvailability = (
  errors: ValidationError[],
  avaliability: string | undefined,
  path: string
): void => {
  if (avaliability && !isValidAvailability(avaliability)) {
    errors.push({
      severity: 'error',
      code: 'C005',
      message: 'Invalid availability. ISO 8601 time intervals format expected.',
      found: avaliability,
      path: `${path}.availability`
    });
  }
};

const checkPricing = (
  errors: ValidationError[],
  pricing: PricingObject | undefined,
  path: string
): void => {
  if (!pricing) {
    return;
  }
  if (pricing.cost && typeof pricing.cost !== 'number') {
    const pathCost = `${path}.cost`;
    errors.push({
      severity: 'error',
      code: 'C006',
      message: `Pricing cost should be a number at ${pathCost}. Found: '${pricing.cost}'`,
      found: pricing.cost,
      path: pathCost
    });
  }
  if (pricing.billing) {
    checkValidBilling(errors, pricing.billing, `${path}.billing`);
  }
};

const checkValidBilling = (errors: ValidationError[], billing: string, path: string): void => {
  const validBillingValues = ['onepay', 'daily', 'weekly', 'monthly', 'quarterly', 'yearl'];
  if (!validBillingValues.includes(billing)) {
    errors.push({
      severity: 'error',
      code: 'C007',
      message: `Billing value not supported at ${path}. Found: '${billing}'`,
      found: billing,
      path
    });
  }
};

const checkQuotas = (
  errors: ValidationError[],
  quotas: QuotasObject | undefined,
  path: string
): void => {
  if (!quotas) {
    return;
  }
  Object.keys(quotas || []).forEach((name) => {
    const quota = quotas[name];
    checkPathObject(errors, quota, `${path}.quotas.['${name}']`);
  });
};
const checkRates = (
  errors: ValidationError[],
  rates: RatesObject | undefined,
  path: string
): void => {
  if (!rates) {
    return;
  }
  Object.keys(rates).forEach((name) => {
    const rate = rates[name];
    checkPathObject(errors, rate, `${path}.rates['${name}']`);
  });
};

const checkPathObject = (errors: ValidationError[], po: PathObject, path: string): void => {
  if (!po) {
    errors.push({
      severity: 'error',
      code: 'C008',
      message: `Missing PathObject at ${path}`,
      path
    });
    return;
  }
  Object.keys(po).forEach((method) => {
    const op = po[method];
    checkMethodObject(errors, op, `${path}.${method}`);
  });
};

const checkMethodObject = (errors: ValidationError[], op: OperationObject, path: string): void => {
  if (!op) {
    errors.push({
      severity: 'error',
      code: 'C009',
      message: `Missing OperationObject at ${path}`,
      path
    });
    return;
  }
  Object.keys(op).forEach((metric) => {
    const limits = op[metric] || [];
    limits.forEach((limit) => {
      checkLimitObject(errors, limit, `${path}.${metric}`);
    });
  });
};
const checkLimitObject = (errors: ValidationError[], limit: LimitObject, path: string): void => {
  if (!limit) {
    errors.push({
      severity: 'error',
      code: 'C010',
      message: `Missing LimitObject at ${path}`,
      path
    });
    return;
  }
  checkPropertyRequired(errors, limit, 'max', path);
  checkPropertyRequired(errors, limit, 'period', path);
  if (limit.max && typeof limit.max !== 'number') {
    errors.push({
      severity: 'error',
      code: 'C011',
      message: `Expected a number at ${path}.max. Found: '${limit.max}'`,
      path: `${path}.max`,
      found: `${limit.max}`
    });
  }
  if (limit.period) {
    checkValidTimePeriod(errors, limit.period, `${path}.period`);
  }
};

const checkValidTimePeriod = (errors: ValidationError[], period: string, path: string): void => {
  const validTimePeriod = ['second', 'minute', 'hour', 'day', 'month', 'year'];
  if (!validTimePeriod.includes(period)) {
    errors.push({
      severity: 'error',
      code: 'C012',
      message: `Expected a valid Time Period at ${path}. Found: '${period}'`,
      path,
      found: period
    });
  }
};

const checkMetricReference = (
  errors: ValidationError[],
  urlRef: UrlReference,
  path: string
): void => {
  checkHasUrlReference(errors, urlRef, path);
};
const checkMetricDefinition = (
  errors: ValidationError[],
  metricDef: MetricObject,
  path: string
): void => {
  checkPropertyRequired(errors, metricDef, 'type', path);
  checkHasValidMetricType(errors, metricDef.type, path + '.type');
  checkHasValidMetricFormat(errors, metricDef.format, path + '.format');
};

const checkHasValidMetricType = (errors: ValidationError[], type: string, path: string): void => {
  if (!['integer', 'number', 'string', 'boolean'].includes(type)) {
    errors.push({
      severity: 'error',
      code: 'C004',
      message: `Unsupported type used at ${path}. Found: '${type}'`,
      path
    });
  }
};
const checkHasValidMetricFormat = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errors: ValidationError[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  path: string
): void => {
  // open to all types of formats (extensible)
};

const checkPropertyRequired = (
  errors: ValidationError[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  property: string,
  path: string,
  validValues?: string[]
): void => {
  const value = obj[property];
  if (value === null || value === undefined) {
    errors.push({
      severity: 'error',
      code: 'C001',
      message: `Property ${property} is required.`,
      path: `${path}`
    });
  } else if (validValues) {
    if (!validValues.includes(value)) {
      const validValuesStr = validValues.map((v) => `'${v}'`).join(', ');
      errors.push({
        severity: 'error',
        code: 'C004',
        message: `Property ${property} must be one of the following values: [${validValuesStr}] but '${value}' was found.`,
        path: path
      });
    }
  }
};
const checkSlaVersion = (errors: ValidationError[], slaVersion: string): void => {
  if (slaVersion && !['1.0.1', '1.0', '1'].includes(slaVersion.trim())) {
    errors.push({
      severity: 'error',
      code: 'C002',
      message: 'SLA Version provided is not supported.',
      found: slaVersion,
      expected: '1.0.1',
      path: 'api'
    });
  }
};
const checkHasUrlReference = (
  errors: ValidationError[],
  urlRef: UrlReference,
  path: string
): void => {
  const url = urlRef.$ref;
  if (!url) {
    errors.push({
      severity: 'error',
      code: 'C003',
      message: `URL reference is required at ${path}`,
      path
    });
  }
};

const checkPropertyDocumentType = (errors: ValidationError[], doc: SlaDocument): void => {
  if (doc?.context?.type === 'plans') {
    if (!doc?.plans) {
      errors.push({
        severity: 'error',
        code: 'C005',
        message: `Missing plans for type='plans'.`,
        path: '.'
      });
    }
    if (doc?.plan) {
      errors.push({
        severity: 'error',
        code: 'C006',
        message: `Unexpected plan found for type='plans'.`,
        path: '.'
      });
    }
  }
  if (doc?.context?.type === 'agreement' && !doc.plan) {
    if (doc?.plans) {
      errors.push({
        severity: 'error',
        code: 'C007',
        message: `Unexpected plans found for type='agreement'.`,
        path: '.'
      });
    }
    if (!doc?.plan) {
      errors.push({
        severity: 'error',
        code: 'C008',
        message: `Missing plan for type='agreement'.`,
        path: '.'
      });
    }
  }
};

const regexValidDate = /^\d{4}-\d{2}-\d{2}$/i;
const regexValidTime = /^\d{2}:\d{2}:\d{2}(\.\d*)?((Z)|([+-]\d{2}:\d{2}))?$/i;
const regexValidDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d*)?((Z)|([+-]\d{2}:\d{2}))?$/i;

const checkValueIsValidDate = (errors: ValidationError[], field: unknown, path: string): void => {
  if (typeof field !== 'string' || !isValidDateOrTime(field.trim())) {
    errors.push({
      severity: 'error',
      code: 'C009',
      message: `Invalid datetime accordingly to ISO 8601.`,
      path
    });
  }
};

const isValidDateOrTime = (ts: string): boolean => {
  return regexValidDate.test(ts) || regexValidTime.test(ts) || regexValidDateTime.test(ts);
};

/** Checks for a valid Repeating Time interval: ISO 8601 */
const isValidAvailability = (availability: string): boolean => {
  // Sample: R5/2008-03-01T13:00:00Z/P1Y2M10DT2H30M

  const mt = /R\d*\/(.*)/i.exec(availability.trim());
  return !!mt && isInterval(mt[0]);
};
/** Checks for a valid Time interval: ISO 8601  */
const isInterval = (interval: string): boolean => {
  // samples:
  // Start and end, such as "2007-03-01T13:00:00Z/2008-05-11T15:30:00Z"
  // Start and duration, such as "2007-03-01T13:00:00Z/P1Y2M10DT2H30M"
  // Duration and end, such as "P1Y2M10DT2H30M/2008-05-11T15:30:00Z"
  // Duration only, such as "P1Y2M10DT2H30M", with additional context information

  const ps = (interval || '').trim().split('/');

  if (ps.length === 3) {
    return (
      (isTimeStamp(ps[1]) &&
        isTimeStamp(ps[2]) &&
        toDateExpression(ps[1]) < toDateExpression(ps[2])) ||
      (isTimeStamp(ps[1]) && isDuration(ps[2])) ||
      (isDuration(ps[1]) && isTimeStamp(ps[2]))
    );
  } else if (ps.length === 2) {
    return isDuration(ps[1]);
  }
  return false;
};

const toDateExpression = (dt: string): Date => {
  const isOnlyTime = regexValidTime.exec(dt.trim());
  if (isOnlyTime) {
    const dt1 = new Date().toISOString().substring(0, 11) + dt.trim();
    return new Date(dt1);
  }
  return new Date(dt);
};

/** Checks for a valid TimeStamp: ISO 8601 */
const isTimeStamp = (ts: string): boolean => {
  // sample: 03:00:00Z
  // sample: 13:00:00+02:00
  // sample: 2007-03-01T13:00:00
  // sample: 2007-03-01T13:00:00+02:00
  // sample: 2007-03-01T13:00:00.123456+02:00

  const mt = isValidDateOrTime(ts.trim());
  return !!mt;
};
/** Checks for a valid Duration: ISO 8601 */
const isDuration = (duration: string): boolean => {
  // sample: P3Y6M4DT12H30M5S
  const mt = /P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?T?(\d+H)?(\d+M)?(\d+S)?/i.exec(duration.trim());
  return !!mt;
};
