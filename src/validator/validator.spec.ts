import * as chai from 'chai';
import { SlaDocument } from '../model/sla-document';
import { SlaValidator } from '../validator/validator';
const expect = chai.expect;

describe('validator', () => {
  it('minimal sla should validate', async () => {
    const doc: SlaDocument = {
      sla: '1.0.0',
      context: {
        id: 'a',
        type: 'plans'
      },
      metrics: {}
    };
    const errors = await SlaValidator.validateDocument(doc);

    expect(errors.length).to.eq(0);
  });
  it('missing sla version', async () => {
    const doc: Partial<SlaDocument> = {
      sla: undefined,
      context: {
        id: 'a',
        type: 'plans'
      },
      metrics: {}
    } as Partial<SlaDocument>;

    const errors = await SlaValidator.validateDocument(doc as SlaDocument);

    expect(errors.length).to.eq(1);
    expect(errors[0].code).to.eq('C001');
    expect(errors[0].message).to.eq('Property sla is required.');
  });
  it('invalid sla version', async () => {
    const doc: SlaDocument = {
      sla: '-12.0.0',
      context: {
        id: 'a',
        type: 'plans'
      },
      metrics: {}
    };
    const errors = await SlaValidator.validateDocument(doc);

    expect(errors.length).to.eq(1);
    expect(errors[0].code).to.eq('C002');
    expect(errors[0].message).to.eq('SLA Version provided is not supported.');
  });
});
