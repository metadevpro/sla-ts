import { PricePeriod } from './price-peridod';

export interface PricingObject {
  /** ISO identifier of the currency */
  currency: string;
  period: PricePeriod;
}
