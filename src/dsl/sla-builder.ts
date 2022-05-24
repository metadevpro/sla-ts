import { stringify as YamlStringify } from 'yaml';
import * as sla from '../model/sla-document';

export class SlaBuilder {
  static createSlaPlansDocument(
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
        type: 'plans',
        api,
        provider
      },
      metrics,
      plans
    };

    const builder = new SlaBuilder(doc);
    return builder;
  }

  static createSlaAgreementDocument(
    slaId: string,
    apiUrl?: string,
    provider?: string,
    metrics: { [metricName: string]: sla.MetricObject | sla.UrlReference } = {},
    terms: sla.PlanObject = {}
  ): SlaBuilder {
    const api = apiUrl ? { $ref: apiUrl } : undefined;

    const doc: sla.SlaDocument = {
      sla: '1.0.0',
      context: {
        id: slaId,
        type: 'agreement',
        api,
        provider
      },
      metrics,
      terms
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
    const ro = ensureRatePath(plan, path);
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
    return YamlStringify(this.doc);
  }
}

/** Ensure a plan is created */
const ensurePlan = (doc: sla.SlaDocument, planName: string): sla.PlanObject => {
  doc.plans = doc.plans || {};
  if (!doc.plans[planName]) {
    doc.plans[planName] = {};
  }
  return doc.plans[planName];
};
/** Ensuere a quota path is created */
const ensureQuotaPath = (plan: sla.PlanObject, path: string): sla.PathObject => {
  plan.quotas = plan.quotas || {};
  if (!plan.quotas[path]) {
    plan.quotas[path] = {};
  }
  return plan.quotas[path];
};

/** Ensuere a rate path is created */
const ensureRatePath = (plan: sla.PlanObject, path: string): sla.PathObject => {
  plan.rates = plan.rates || {};
  if (!plan.rates[path]) {
    plan.rates[path] = {};
  }
  return plan.rates[path];
};

const addLimit = (
  po: sla.PathObject,
  verb: string,
  metric: string,
  limit: sla.LimitObject
): void => {
  let vi = po[verb];
  if (!vi) {
    vi = {};
    po[verb] = vi;
  }
  if (!vi[metric]) {
    vi[metric] = [];
  }
  vi[metric].push(limit);
};
