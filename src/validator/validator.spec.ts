import { SlaDocument } from '../model/sla-document';
import { SlaValidator } from '../validator/validator';

describe('validator', () => {
  it('minimal sla should validate', async () => {
    const doc: SlaDocument = {
      sla: '1.0.0',
      context: {
        id: 'a',
        type: 'plans'
      },
      metrics: {},
      plans: {}
    };
    const errors = await SlaValidator.validateDocument(doc);

    expect(errors.length).toEqual(0);
  });
  it('invalid value on type should report correct path on error', async () => {
    const doc: SlaDocument = {
      sla: '1.0.0',
      context: {
        id: 'a',
        type: 'invalid'
      },
      metrics: {},
      plans: {}
    } as unknown as SlaDocument;
    const errors = await SlaValidator.validateDocument(doc);

    expect(errors.length).toEqual(1);
    expect(errors[0].path).toEqual('context.type');
  });
  it('missing type should report correct path on error', async () => {
    const doc: SlaDocument = {
      sla: '1.0.0',
      context: {
        id: 'a',
        xtype: 'invalid'
      },
      metrics: {},
      plans: {}
    } as unknown as SlaDocument;
    const errors = await SlaValidator.validateDocument(doc);

    expect(errors.length).toEqual(1);
    expect(errors[0].path).toEqual('context.type');
  });
  it('missing sla version', async () => {
    const doc: Partial<SlaDocument> = {
      sla: undefined,
      context: {
        id: 'a',
        type: 'plans'
      },
      metrics: {},
      plans: {}
    } as Partial<SlaDocument>;

    const errors = await SlaValidator.validateDocument(doc as SlaDocument);

    expect(errors.length).toEqual(1);
    expect(errors[0].code).toEqual('C001');
    expect(errors[0].message).toEqual('Property sla is required.');
  });
  it('invalid sla version', async () => {
    const doc: SlaDocument = {
      sla: '-12.0.0',
      context: {
        id: 'a',
        type: 'plans'
      },
      metrics: {},
      plans: {}
    };
    const errors = await SlaValidator.validateDocument(doc);

    expect(errors.length).toEqual(1);
    expect(errors[0].code).toEqual('C002');
    expect(errors[0].message).toEqual('SLA Version provided is not supported.');
  });

  it('should report invalid availability', async () => {
    const doc: SlaDocument = {
      sla: '1.0.0',
      context: {
        id: 'a',
        type: 'plans'
      },
      metrics: {},
      plans: {
        base: {
          availability: 'R/00:00:00Z/23:00ABC'
        }
      }
    };
    const errors = await SlaValidator.validateDocument(doc);

    expect(errors.length).toEqual(1);
    expect(errors[0].code).toEqual('C005');
    expect(errors[0].message).toEqual(
      'Invalid availability. ISO 8601 time intervals format expected.'
    );
  });
  it('should report valid availability', async () => {
    const doc: SlaDocument = {
      sla: '1.0.0',
      context: {
        id: 'a',
        type: 'plans'
      },
      metrics: {},
      plans: {
        base: {
          availability: 'R/00:00:00Z/23:00:00Z'
        }
      }
    };
    const errors = await SlaValidator.validateDocument(doc);

    expect(errors.length).toEqual(0);
  });
});
