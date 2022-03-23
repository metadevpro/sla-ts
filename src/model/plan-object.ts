import { PricePeriod } from './price-peridod';

/** Plan Object */
export interface PlanObject {
  pricing?: {
    cost: number;
  };
  rates?: { [path: string]: PathObject };
}

export type HttpVerb = 'get' | 'put' | 'post' | 'options' | 'delete' | 'trace' | 'head';

export interface PathObject {
  [verb: string]: MetricConstraintObject;
}

export interface MetricConstraintObject {
  [metric: string]: ConstraintObject[];
}

export interface ConstraintObject {
  max?: number;
  min?: number;
  period?: PricePeriod;
}
