import * as yaml from 'yaml';
import * as sla from '../model';
import { LimitObject, PathObject, PlanObject } from '../model';

export class SlaBuilder {
  static createSlaDocument(
    slaId: string,
    apiUrl?: string,
    provider?: string,
    metrics: { [metricName: string]: sla.MetricObject | sla.UrlReference } = {},
    plans: { [planName: string]: sla.PlanObject } = {}
  ): SlaBuilder {
    const api = apiUrl ? { $ref: apiUrl } : undefined;

    const doc: sla.SlaDocument = {
      sla: '1.0.0',
      context: {
        id: slaId,
        api,
        provider
      },
      metrics,
      plans
    };

    const builder = new SlaBuilder(doc);
    return builder;
  }

  constructor(private doc: sla.SlaDocument) {}

  addMetricDefinition(metricName: string, metricDefinition: sla.MetricObject): SlaBuilder {
    this.doc.metrics[metricName] = metricDefinition;
    return this;
  }
  addMetricReference(metricName: string, url: string): SlaBuilder {
    this.doc.metrics[metricName] = { $ref: url };
    return this;
  }
  addPlan(planName: string, plan: sla.PlanObject) {
    this.doc.plans = this.doc.plans || {};
    this.doc.plans[planName] = plan;
    return this;
  }
  addQuota(planName: string, path: string, verb: string, metric: string, limit: sla.LimitObject) {
    this.doc.plans = this.doc.plans || {};
    const plan = ensurePlan(this.doc, planName);
    const qo = ensureQuotaPath(plan, path);
    addLimit(qo, verb, metric, limit);
    return this;
  }
  addRate(planName: string, path: string, verb: string, metric: string, limit: sla.LimitObject) {
    const plan = ensurePlan(this.doc, planName);
    const ro = ensureRatePathPath(plan, path);
    addLimit(ro, verb, metric, limit);
    return this;
  }

  getSla(): sla.SlaDocument {
    return this.doc;
  }
  getSlaAsJson(
    replacer?: (key: string, value: unknown) => unknown,
    space?: string | number
  ): string {
    return JSON.stringify(this.doc, replacer, space);
  }
  getSlaAsYaml(): string {
    return yaml.stringify(this.doc);
  }
}

/** Ensure a plan is created */
const ensurePlan = (doc: sla.SlaDocument, planName: string): PlanObject => {
  doc.plans = doc.plans || {};
  if (!doc.plans[planName]) {
    doc.plans[planName] = {};
  }
  return doc.plans[planName];
};
/** Ensuere a quota path is created */
const ensureQuotaPath = (plan: PlanObject, path: string): sla.PathObject => {
  plan.quotas = plan.quotas || {};
  if (!plan.quotas[path]) {
    plan.quotas[path] = {};
  }
  return plan.quotas[path];
};

/** Ensuere a rate path is created */
const ensureRatePathPath = (plan: PlanObject, path: string): sla.PathObject => {
  plan.rates = plan.quotas || {};
  if (!plan.rates[path]) {
    plan.rates[path] = {};
  }
  return plan.rates[path];
};

const addLimit = (po: PathObject, verb: string, metric: string, limit: LimitObject): void => {
  po[verb] = po[verb] || {};
  po[verb][metric] = limit;
};
