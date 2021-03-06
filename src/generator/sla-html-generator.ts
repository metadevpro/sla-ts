import {
  LimitObject,
  MetricObject,
  PathObject,
  PlanObject,
  PricingObject,
  SlaDocument,
  UrlReference
} from '../model';

const spc10 = '          ';

export const slaToHtml = (sla: SlaDocument, cssUri: string): string => {
  const title = sla.context.id;
  const version = sla.sla;
  const generatedAt = new Date().toISOString();
  const content = sla?.context?.type === 'agreement' ? generateTerms(sla) : generatePlans(sla);
  const validity = getValidity(sla);

  const slaTsUri = 'https://github.com/metadevpro/sla-ts';
  const slaTsLabel = 'sla-ts';

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
      <link rel="stylesheet" href="${cssUri}">
    </head>
    <body class="sla-document">
      <header>
        <div>SLA Document<div>
        <a name="context">
          <h1>${title}</h1>
        </a>
        <div class="version">Version: <span class="version-value">${version}</span><div>
      </header>
      <main>
        <div class="context">
          <h2>Context</h2>
          <div class="block">
            ${generateProperty('Id', 'id', sla?.context?.id, spc10)}
            ${generateProperty('Type', 'type', sla?.context?.type, spc10)}
            ${generateProperty('API', 'api', sla?.context?.api?.$ref || '', spc10)}
            ${generateProperty('Provider', 'provider', sla?.context?.provider || '', spc10)}
            ${generateProperty('Validity', 'Validity', validity, spc10)}
          </div>
        </div>
        <div class="metrics">
          <a name="metrics">
            <h2>Metrics</h2>
          </a>
          ${generateMetrics(sla.metrics)}
        </div>
        ${content}
      </main>
      <footer>
        <span>Generated at ${generatedAt} with <a href="${slaTsUri}">${slaTsLabel}</a>.</span>
      </footer>
    <body>
  </html>`;

  return html;
};

const getValidity = (sla: SlaDocument): string => {
  const validity = sla?.context?.validity;
  if (validity) {
    let result = '';
    if (validity?.from) {
      result = `from ${validity.from} `;
    }
    if (validity?.from) {
      result = `to ${validity.to}`;
    }
    return result || '-';
  }
  return '-';
};

const generateProperty = (
  label: string,
  fieldName: string,
  value: string,
  prefix: string
): string => {
  return `${prefix}<div class="${fieldName} field">
${prefix}  <label for="${fieldName}">${label}</label>
${prefix}  <div name="${fieldName}">${value}</div>
${prefix}</div>`;
};

const generateMetrics = (metrics: { [key: string]: MetricObject | UrlReference }): string => {
  const metricsHtml = Object.keys(metrics)
    .map((key) => generateMetricForTable(key, metrics[key]))
    .join('\n');
  return `  <table class="metrics">
    <thead>
      <th class="name">Name</th>
      <th class="type">Type</th>
      <th class="format">Format</th>
      <th class="description">Description</th>
    </thead>
    <tbody>
      ${metricsHtml}     
    </tbody>
    <tfooter>
    </tfooter>    
  </table>`;
};

const generatePlans = (sla: SlaDocument): string => {
  const plans = sla.plans || {};

  const content = Object.keys(plans)
    .map((key) => generatePlan(key, plans[key]))
    .join('\n');

  const plansIndex = Object.keys(plans)
    .map((planName) => {
      return `<a href="#plan-${planName}">${planName}</a>`;
    })
    .join('&nbsp;|&nbsp;\n');

  const html = `<div>
    <a name="plans">
      <h2>Plans</h2>
    </a>
    ${plansIndex}
    ${content}
  </div>`;

  return html;
};

const generateMetricForTable = (name: string, metric: MetricObject | UrlReference): string => {
  const mo = metric as MetricObject;

  if (mo.type) {
    return `<tr class="metric">
        <td class="name"><a name="metric-${name}"><code>${name}</code></a></td>
        <td class="type"><code>${mo.type}</code></td>
        <td class="format"><code>${mo.format}</code></td>
        <td class="description">${mo.description}</td>
      </tr>`;
  } else {
    const urlRef = metric as UrlReference;

    return `<tr class="metric">
        <td class="name"><a name="metric-${name}"><code>${name}</code></a></td>
        <td class="type"><code>reference</code></td>
        <td class="format"><code></code></td>
        <td class="description">${urlRef.$ref}</td>
      </tr>`;
  }
};

const generateTerms = (sla: SlaDocument): string => {
  const terms = sla.plan;
  const content = terms ? generatePlan('terms', terms) : '';
  const html = `
  <div>
    <a name="terms">
      <h2>Terms</h2>
    </a>
    ${content}
  </div>`;
  return html;
};

const generatePlan = (planName: string, plan: PlanObject): string => {
  const html = `  <div class="plan">
    <a name="plan-${planName}">
      <h3>Plan: ${planName}</h3>
    </a>
    <div class="block">
      ${generateProperty('Availability', 'availability', plan?.availability || '', spc10)}
      ${generatePricing(planName, plan?.pricing)}
      ${generateRates(planName, plan)}
      ${generateQuotas(planName, plan)}
    </div>
  </div>`;
  return html;
};

const generatePricing = (planName: string, pricing?: PricingObject): string => {
  if (!pricing) {
    return '';
  }
  return `<div class="pricing">
  <a name="${planName}-pricing"><h4>Pricing</h4></a>
  <div class="block">
    ${generateProperty('Cost', 'cost', `${pricing.cost}`, spc10)}
    ${generateProperty('Currency', 'currency', pricing?.currency || '-', spc10)}
    ${generateProperty('Billing', 'billing', pricing?.billing || '-', spc10)}
  </div>
</div>
`;
};
const generateRates = (planName: string, plan: PlanObject): string => {
  const rates = plan.rates;

  const content = !rates
    ? '<span>No rates were defined.</span>'
    : tableForRatesOrQuota(
        'rates',
        Object.keys(rates)
          .map((path) => generateLimitsForPath(path, rates[path]))
          .join('\n')
      );

  const html = `<div class="rates">
    <a name="${planName}-rates">
      <h4>Rates</h4>
    </a>
    ${content}
  </div>`;
  return html;
};
const generateQuotas = (planName: string, plan: PlanObject): string => {
  const quotas = plan.quotas;

  const content = !quotas
    ? '<span>No quotas were defined.</span>'
    : tableForRatesOrQuota(
        'quotas',
        Object.keys(quotas)
          .map((path) => generateLimitsForPath(path, quotas[path]))
          .join('\n')
      );

  const html = `<div class="quotas">
    <a name="${planName}-quotas">
      <h4>Quotas</h4>
    </a>
    ${content}
  </div>`;
  return html;
};

const tableForRatesOrQuota = (type: string, contentHtml: string): string => {
  return `<table class="${type}">
  <thead>
    <th class="verb">Verb</th>
    <th class="path">Path</th>
    <th class="metric">Metric</th>
    <th class="limits">Limits</th>
  </thead>
  <tbody>
    ${contentHtml}
  </tbody>
</table>`;
};

const generateLimitsForPath = (path: string, pathObject: PathObject): string => {
  const poLimits: { verb: string; path: string; metric: string; limits: LimitObject[] }[] = [];

  let firstTime = true;
  Object.keys(pathObject).map((verb) => {
    const operationalObject = pathObject[verb];
    Object.keys(operationalObject).map((metric) => {
      const limits = operationalObject[metric] || [];
      poLimits.push({
        verb: firstTime ? verb : '',
        path: firstTime ? path : '',
        metric,
        limits
      });
      firstTime = false;
    });
  });

  return poLimits
    .map((po) => {
      return `<tr>
    <td class="verb ${(po.verb || '').toLowerCase()}"><code>${po.verb}<code></td>
    <td class="path"><code>${po.path}<code></td>
    <td class="metric"><a href="#metric-${po.metric}"><code>${po.metric}</code></a></td>
    <td class="limit">${generateLimits(po.limits)}</td>
  </tr>`;
    })
    .join('\n');
};

const generateLimits = (limits: LimitObject[]): string => {
  return (limits || []).map((limit) => generateLimit(limit)).join('\n');
};
const generateLimit = (limit: LimitObject): string => {
  return `<div class="limit">
    ${generateProperty('Maximum', 'max', `${limit.max}`, spc10)}
    ${generateProperty('Period', 'period', `${limit.period}`, spc10)}
  </div>`;
};
