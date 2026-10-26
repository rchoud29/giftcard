import { GiftCard } from './GiftCard.js';

/*
 * Fictional sample cards. Amounts are integer cents. Each card's current
 * balance is derived from its original balance and history:
 *
 *   Target     5000 - 1250 + 250         = 4000  (Active)
 *   Amazon    10000 - 2999 - 1500        = 5501  (Active)
 *   Starbucks  2500 - 575 - 650 - 1275   =    0  (Depleted)
 *   Walmart    7500 - 2000               = 5500  (Expired 2025-06-30)
 *   Best Buy  15000 - 8999               = 6001  (Active)
 */
const SAMPLE_CARDS = [
  {
    id: 'GC-TGT-0001',
    merchant: 'Target',
    originalBalance: 5000,
    expirationDate: '2028-12-31T23:59:59Z',
    restrictions: ['Valid in-store and on target.com', 'Not redeemable for cash'],
    transactions: [
      { id: 'TXN-TGT-1', type: 'purchase', amount: 1250, description: 'Household supplies', timestamp: '2026-03-04T15:22:00Z' },
      { id: 'TXN-TGT-2', type: 'refund', amount: 250, description: 'Returned dish soap', timestamp: '2026-03-09T10:05:00Z' },
    ],
  },
  {
    id: 'GC-AMZ-0002',
    merchant: 'Amazon',
    originalBalance: 10000,
    expirationDate: null,
    restrictions: ['Online purchases only', 'Cannot be used to buy other gift cards'],
    transactions: [
      { id: 'TXN-AMZ-1', type: 'purchase', amount: 2999, description: 'Wireless headphones', timestamp: '2026-05-12T18:40:00Z' },
      { id: 'TXN-AMZ-2', type: 'purchase', amount: 1500, description: 'Paperback books', timestamp: '2026-06-01T12:15:00Z' },
    ],
  },
  {
    id: 'GC-SBX-0003',
    merchant: 'Starbucks',
    originalBalance: 2500,
    expirationDate: null,
    restrictions: ['Participating U.S. stores only'],
    transactions: [
      { id: 'TXN-SBX-1', type: 'purchase', amount: 575, description: 'Latte', timestamp: '2026-07-02T08:10:00Z' },
      { id: 'TXN-SBX-2', type: 'purchase', amount: 650, description: 'Cold brew and pastry', timestamp: '2026-07-09T08:30:00Z' },
      { id: 'TXN-SBX-3', type: 'purchase', amount: 1275, description: 'Coffee beans', timestamp: '2026-07-20T09:45:00Z' },
    ],
  },
  {
    id: 'GC-WMT-0004',
    merchant: 'Walmart',
    originalBalance: 7500,
    expirationDate: '2025-06-30T23:59:59Z',
    restrictions: ['In-store only', 'Expires June 30, 2025'],
    transactions: [
      { id: 'TXN-WMT-1', type: 'purchase', amount: 2000, description: 'Groceries', timestamp: '2025-02-14T16:00:00Z' },
    ],
  },
  {
    id: 'GC-BBY-0005',
    merchant: 'Best Buy',
    originalBalance: 15000,
    expirationDate: '2029-01-31T23:59:59Z',
    restrictions: ['Not valid for Geek Squad memberships'],
    transactions: [
      { id: 'TXN-BBY-1', type: 'purchase', amount: 8999, description: 'Portable SSD', timestamp: '2026-08-22T19:30:00Z' },
    ],
  },
];

/**
 * Returns a fresh set of GiftCard instances on every call, so callers
 * (including tests) can mutate them without affecting each other.
 */
export function createSampleCards() {
  return SAMPLE_CARDS.map((data) => new GiftCard(structuredClone(data)));
}
