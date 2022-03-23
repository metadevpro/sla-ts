export interface PricePeriod {
  /** Unit price in currency for the period of time considered. */
  amount: number;
  /** Period of time for pricing */
  unit: 'day' | 'week' | 'month' | 'year' | 'forever';
}
