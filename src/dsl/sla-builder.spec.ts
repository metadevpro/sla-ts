import * as chai from 'chai';
import { MetricObject } from '../model';
import { SlaBuilder } from './sla-builder';
const expect = chai.expect;

describe('sla-builder', () => {
  it('should create a minimal SLA Document', () => {
    const sut = SlaBuilder.createSlaPlansDocument('sample1', 'https://acme.com', 'Acme Corp.');
    const doc = sut.getSla();

    expect(doc).to.be.not.null;
    expect(doc.sla).to.eql('1.0.0');
    expect(doc?.context.id).to.eql('sample1');
    expect(doc?.context.api?.$ref).to.eql('https://acme.com');
    expect(doc?.context.provider).to.eql('Acme Corp.');
    expect(doc.metrics).to.eql({});
    expect(doc.plans).to.eql({});
  });
  it('should create a minimal SLA Document as json', () => {
    const sut = SlaBuilder.createSlaPlansDocument('sample1', 'https://acme.com', 'Acme Corp.');
    const result = sut.getSlaAsJson();

    expect(result).to.eql(
      `{"sla":"1.0.0","context":{"id":"sample1","type":"plans","api":{"$ref":"https://acme.com"},"provider":"Acme Corp."},"metrics":{},"plans":{}}`
    );
  });
  it('should create a minimal SLA Document as yaml', () => {
    const sut = SlaBuilder.createSlaPlansDocument('sample1', 'https://acme.com', 'Acme Corp.');
    const result = sut.getSlaAsYaml();

    expect(result).to.eql(`sla: 1.0.0
context:
  id: sample1
  type: plans
  api:
    $ref: https://acme.com
  provider: Acme Corp.
metrics: {}
plans: {}
`);
  });

  it('should add a metric definition', () => {
    const metricDef = {
      type: 'integer',
      format: 'int64',
      description: 'abc'
    } as MetricObject;
    const sut = SlaBuilder.createSlaPlansDocument('sample1').addMetricDefinition('m1', metricDef);
    const doc = sut.getSla();

    expect(Object.keys(doc.metrics).length).to.eql(1);
    expect(doc.metrics['m1']).to.eql(metricDef);
  });
  it('should add a metric reference', () => {
    const url = 'https://acme.com/metric/m1';
    const sut = SlaBuilder.createSlaPlansDocument('sample1').addMetricReference('m1', url);
    const doc = sut.getSla();

    expect(Object.keys(doc.metrics).length).to.eql(1);
    expect(doc.metrics['m1']).to.eql({ $ref: url });
  });
  it('should add a plan', () => {
    const sut = SlaBuilder.createSlaPlansDocument('sample1').addPlan('planBasic', {});
    const doc = sut.getSla();

    expect(Object.keys(doc.plans || {}).length).to.eql(1);
    expect(doc.plans?.['planBasic']).to.eql({});
  });
  it('should add a quota', () => {
    const sut = SlaBuilder.createSlaPlansDocument('sample1')
      .addPlan('pro', {})
      .addQuota('basic', '/admin/users', 'put', 'm1', { max: 3, period: 'day' });
    const doc = sut.getSla();

    expect(Object.keys(doc.plans || {}).length).to.eql(2);
    expect(doc.plans?.['basic']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']['m1']).to.eql([
      {
        max: 3,
        period: 'day'
      }
    ]);
  });
  it('should add a second quota for a different plan', () => {
    const sut = SlaBuilder.createSlaPlansDocument('sample1')
      .addPlan('pro', {})
      .addQuota('basic', '/admin/users', 'put', 'm1', { max: 3, period: 'day' })
      .addQuota('pro', '/admin/rooms', 'get', 'm1', { max: 4, period: 'day' });
    const doc = sut.getSla();

    expect(Object.keys(doc.plans || {}).length).to.eql(2);
    expect(doc.plans?.['basic']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']['m1']).to.eql([
      {
        max: 3,
        period: 'day'
      }
    ]);
    expect(doc.plans?.['pro'].quotas?.['/admin/rooms']['get']).to.not.null;
    expect(doc.plans?.['pro'].quotas?.['/admin/rooms']['get']['m1']).to.eql([
      {
        max: 4,
        period: 'day'
      }
    ]);
  });
  it('should add a second quota for a different path', () => {
    const sut = SlaBuilder.createSlaPlansDocument('sample1')
      .addPlan('pro', {})
      .addQuota('basic', '/admin/users', 'put', 'm1', { max: 3, period: 'day' })
      .addQuota('basic', '/admin/rooms', 'get', 'm1', { max: 4, period: 'day' });
    const doc = sut.getSla();

    expect(Object.keys(doc.plans || {}).length).to.eql(2);
    expect(doc.plans?.['basic']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']['m1']).to.eql([
      {
        max: 3,
        period: 'day'
      }
    ]);
    expect(doc.plans?.['basic'].quotas?.['/admin/rooms']['get']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/rooms']['get']['m1']).to.eql([
      {
        max: 4,
        period: 'day'
      }
    ]);
  });
  it('should add a second quota for a different verb', () => {
    const sut = SlaBuilder.createSlaPlansDocument('sample1')
      .addPlan('pro', {})
      .addQuota('basic', '/admin/users', 'put', 'm1', { max: 3, period: 'day' })
      .addQuota('basic', '/admin/users', 'get', 'm1', { max: 4, period: 'day' });
    const doc = sut.getSla();

    expect(Object.keys(doc.plans || {}).length).to.eql(2);
    expect(doc.plans?.['basic']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']['m1']).to.eql([
      {
        max: 3,
        period: 'day'
      }
    ]);
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['get']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['get']['m1']).to.eql([
      {
        max: 4,
        period: 'day'
      }
    ]);
  });
  it('should add a second quota for a different metric', () => {
    const sut = SlaBuilder.createSlaPlansDocument('sample1')
      .addPlan('pro', {})
      .addQuota('basic', '/admin/users', 'put', 'm1', { max: 3, period: 'day' })
      .addQuota('basic', '/admin/users', 'put', 'm2', { max: 4, period: 'day' });
    const doc = sut.getSla();

    expect(Object.keys(doc.plans || {}).length).to.eql(2);
    expect(doc.plans?.['basic']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']).to.not.null;
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']['m1']).to.eql([
      {
        max: 3,
        period: 'day'
      }
    ]);
    expect(doc.plans?.['basic'].quotas?.['/admin/users']['put']['m2']).to.eql([
      {
        max: 4,
        period: 'day'
      }
    ]);
  });

  it('should add a rate', () => {
    const sut = SlaBuilder.createSlaPlansDocument('sample1').addRate(
      'basic',
      '/admin/users',
      'put',
      'm1',
      { max: 3, period: 'day' }
    );
    const doc = sut.getSla();

    expect(Object.keys(doc.plans || {}).length).to.eql(1);
    expect(doc.plans?.['basic']).to.not.null;
    expect(doc.plans?.['basic'].rates?.['/admin/users']).to.not.null;
    expect(doc.plans?.['basic'].rates?.['/admin/users']['put']).to.not.null;
    expect(doc.plans?.['basic'].rates?.['/admin/users']['put']['m1']).to.eql([
      {
        max: 3,
        period: 'day'
      }
    ]);
  });
  it('should create a simple SLA', () => {
    const metricDef = {
      type: 'integer',
      format: 'int64',
      description: 'abc'
    } as MetricObject;
    const sut = SlaBuilder.createSlaPlansDocument('sample2')
      .addMetricDefinition('m1', metricDef)
      .addMetricReference('m2', 'https://acme.com/metrics/m2')
      .addPlan('basic', {})
      .addPlan('pro', {})
      .addRate('basic', '/admin/users', 'put', 'm1', { max: 3, period: 'day' })
      .addRate('basic', '/admin/users', 'get', 'm1', { max: 100, period: 'day' })
      .addQuota('basic', '/rooms', 'get', 'm2', { max: 10, period: 'day' })
      .addQuota('basic', '/rooms', 'post', 'm2', { max: 5, period: 'day' })
      .addRate('pro', '/admin/users', 'put', 'm1', { max: 53, period: 'day' })
      .addQuota('pro', '/rooms', 'get', 'm2', { max: 50, period: 'day' });

    const doc = sut.getSla();

    expect(Object.keys(doc.plans || {}).length).to.eql(2);
    expect(doc.plans?.['basic']).to.not.null;
    expect(doc.plans?.['basic'].rates?.['/admin/users']).to.not.null;
    expect(Object.keys(doc.plans?.['basic'].rates?.['/admin/users'] || []).length).to.eql(2);
    expect(doc.plans?.['basic'].rates?.['/admin/users']['put']).to.not.null;

    expect(doc.plans?.['basic'].rates?.['/admin/users']['put']['m1']).to.eql([
      {
        max: 3,
        period: 'day'
      }
    ]);
  });
});
