import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { Wallet } from '../src/Wallet.js';
import { GiftCard, CardStatus } from '../src/GiftCard.js';
import { Transaction, TransactionType } from '../src/Transaction.js';
import { createSampleCards } from '../src/sampleData.js';

const PAST = '2020-01-01T00:00:00Z';
const FUTURE = '2099-12-31T23:59:59Z';

function makeCard(overrides = {}) {
  return new GiftCard({ id: 'TEST-1', merchant: 'Test Shop', originalBalance: 5000, expirationDate: FUTURE, ...overrides });
}

function rejectsWith(code) {
  return (error) => error.code === code;
}

describe('Wallet card management', () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
    wallet.addCards(createSampleCards());
  });

  it('adds gift cards', () => {
    assert.equal(wallet.size, 5);
    wallet.addCard(makeCard());
    assert.equal(wallet.size, 6);
    assert.ok(wallet.hasCard('TEST-1'));
  });

  it('rejects non-GiftCard objects', () => {
    assert.throws(() => wallet.addCard({ id: 'FAKE' }), TypeError);
  });

  it('removes gift cards', () => {
    const removed = wallet.removeCard('GC-AMZ-0002');
    assert.equal(removed.merchant, 'Amazon');
    assert.equal(wallet.size, 4);
    assert.equal(wallet.hasCard('GC-AMZ-0002'), false);
    assert.throws(() => wallet.removeCard('GC-AMZ-0002'), /No gift card/);
  });

  it('retrieves cards by ID', () => {
    const card = wallet.getCard('GC-SBX-0003');
    assert.ok(card instanceof GiftCard);
    assert.equal(card.merchant, 'Starbucks');
    assert.throws(() => wallet.getCard('MISSING'), /No gift card/);
  });

  it('lists all cards', () => {
    const merchants = wallet.listCards().map((card) => card.merchant);
    assert.deepEqual(merchants, ['Target', 'Amazon', 'Starbucks', 'Walmart', 'Best Buy']);
  });

  it('prevents duplicate card IDs', () => {
    assert.throws(() => wallet.addCard(makeCard({ id: 'GC-TGT-0001' })), /already exists/);
    assert.equal(wallet.size, 5);
  });

  it('calculates card and wallet balances', () => {
    assert.equal(wallet.getCardBalance('GC-TGT-0001'), 4000);
    assert.equal(wallet.getTotalBalance(), 15502);
    assert.equal(wallet.getTotalBalance({ includeExpired: true }), 15502 + 5500);
  });

  it('starts empty with a zero balance', () => {
    assert.equal(new Wallet().getTotalBalance(), 0);
  });
});

describe('Sample data', () => {
  it('has mathematically consistent balances and histories', () => {
    for (const card of createSampleCards()) {
      const net = card.getTransactionHistory().reduce((sum, txn) => sum + txn.balanceEffect, 0);
      assert.equal(card.getBalance(), card.originalBalance + net, card.id);
    }
  });

  it('includes cards in every status', () => {
    const statuses = new Set(createSampleCards().map((card) => card.status));
    assert.deepEqual(statuses, new Set([CardStatus.ACTIVE, CardStatus.DEPLETED, CardStatus.EXPIRED]));
  });

  it('returns independent instances on each call', () => {
    const [first] = createSampleCards();
    first.purchase(1000, 'Mutation');
    const [fresh] = createSampleCards();
    assert.equal(fresh.getBalance(), 4000);
    assert.equal(fresh.getTransactionHistory().length, 2);
  });
});

describe('Transactions', () => {
  let card;

  beforeEach(() => {
    card = makeCard();
  });

  it('processes a successful purchase', () => {
    const txn = card.purchase(1999, 'Shoes');
    assert.ok(txn instanceof Transaction);
    assert.equal(txn.type, TransactionType.PURCHASE);
    assert.equal(txn.cardId, 'TEST-1');
    assert.equal(card.getBalance(), 3001);
    assert.equal(card.status, CardStatus.ACTIVE);
  });

  it('purchases through the wallet', () => {
    const wallet = new Wallet();
    wallet.addCard(card);
    wallet.purchase('TEST-1', 500, 'Snack');
    assert.equal(wallet.getCardBalance('TEST-1'), 4500);
  });

  it('rejects purchases exceeding the balance without changing state', () => {
    card.purchase(1000, 'First');
    assert.throws(() => card.purchase(4001, 'Too much'), rejectsWith('INSUFFICIENT_FUNDS'));
    assert.equal(card.getBalance(), 4000);
    assert.equal(card.getTransactionHistory().length, 1);
  });

  it('processes refunds', () => {
    card.purchase(2000, 'Jacket');
    const txn = card.refund(750, 'Partial return');
    assert.equal(txn.type, TransactionType.REFUND);
    assert.equal(card.getBalance(), 3750);
  });

  it('rejects refunds that exceed the amount spent', () => {
    card.purchase(1000, 'Item');
    assert.throws(() => card.refund(1001, 'Over-refund'), rejectsWith('REFUND_EXCEEDS_SPENT'));
    assert.equal(card.getBalance(), 4000);
    assert.equal(card.getTransactionHistory().length, 1);
  });

  it('records transaction history in order', () => {
    card.purchase(1000, 'A');
    card.refund(400, 'B');
    card.purchase(250, 'C');
    const history = card.getTransactionHistory();
    assert.deepEqual(history.map((t) => t.description), ['A', 'B', 'C']);
    assert.deepEqual(history.map((t) => t.type), ['purchase', 'refund', 'purchase']);
    assert.equal(new Set(history.map((t) => t.id)).size, 3);
    assert.ok(history.every((t) => t.timestamp instanceof Date));
  });

  it('returns history as a copy that cannot alter the card', () => {
    card.purchase(1000, 'A');
    const history = card.getTransactionHistory();
    history.pop();
    assert.equal(card.getTransactionHistory().length, 1);
    assert.throws(() => {
      card.getTransactionHistory()[0].amount = 1;
    }, TypeError);
  });

  it('exposes history through the wallet', () => {
    const wallet = new Wallet();
    wallet.addCards(createSampleCards());
    assert.equal(wallet.getTransactionHistory('GC-SBX-0003').length, 3);
  });

  for (const amount of [0, -500, 10.5, NaN, '100']) {
    it(`rejects invalid amount ${String(amount)} without changing state`, () => {
      assert.throws(() => card.purchase(amount, 'Bad'), rejectsWith('INVALID_AMOUNT'));
      assert.throws(() => card.refund(amount, 'Bad'), rejectsWith('INVALID_AMOUNT'));
      assert.equal(card.getBalance(), 5000);
      assert.equal(card.getTransactionHistory().length, 0);
    });
  }

  it('rejects purchases on expired cards', () => {
    const expired = makeCard({ expirationDate: PAST });
    assert.equal(expired.status, CardStatus.EXPIRED);
    assert.throws(() => expired.purchase(100, 'Late'), rejectsWith('CARD_EXPIRED'));
    assert.equal(expired.getBalance(), 5000);
    assert.equal(expired.getTransactionHistory().length, 0);
  });

  it('marks a card depleted at zero and blocks further purchases', () => {
    card.purchase(5000, 'Everything');
    assert.equal(card.getBalance(), 0);
    assert.equal(card.status, CardStatus.DEPLETED);
    assert.throws(() => card.purchase(1, 'More'), rejectsWith('CARD_DEPLETED'));
    assert.equal(card.getTransactionHistory().length, 1);
  });

  it('reactivates a depleted card after a refund', () => {
    card.purchase(5000, 'Everything');
    card.refund(1000, 'Return');
    assert.equal(card.status, CardStatus.ACTIVE);
    assert.equal(card.getBalance(), 1000);
  });

  it('rejects inconsistent initial history', () => {
    assert.throws(
      () => makeCard({ transactions: [{ type: 'purchase', amount: 6000, timestamp: '2026-01-01T00:00:00Z' }] }),
      rejectsWith('INSUFFICIENT_FUNDS'),
    );
  });
});
