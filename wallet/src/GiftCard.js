import { Transaction, TransactionError, TransactionType } from './Transaction.js';
import { formatCents, isValidCents } from './money.js';

export const CardStatus = Object.freeze({
  ACTIVE: 'Active',
  DEPLETED: 'Depleted',
  EXPIRED: 'Expired',
});

/**
 * A single gift card. Balances are integer cents.
 *
 * The current balance is never passed in directly: it starts at the original
 * balance and is derived by replaying any initial transaction history through
 * the same rules used for new transactions, so history and balance always agree.
 */
export class GiftCard {
  #id;
  #merchant;
  #originalBalance;
  #currentBalance;
  #expirationDate;
  #restrictions;
  #transactions = [];

  constructor({ id, merchant, originalBalance, expirationDate = null, restrictions = [], transactions = [] }) {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new TypeError('Gift card requires a non-empty string ID.');
    }
    if (typeof merchant !== 'string' || merchant.trim() === '') {
      throw new TypeError('Gift card requires a merchant name.');
    }
    if (!isValidCents(originalBalance) || originalBalance === 0) {
      throw new RangeError('Original balance must be a positive integer number of cents.');
    }

    this.#id = id;
    this.#merchant = merchant;
    this.#originalBalance = originalBalance;
    this.#currentBalance = originalBalance;
    this.#expirationDate = expirationDate === null ? null : new Date(expirationDate);
    this.#restrictions = Object.freeze([...restrictions]);

    if (this.#expirationDate !== null && Number.isNaN(this.#expirationDate.getTime())) {
      throw new TypeError(`Invalid expiration date "${expirationDate}".`);
    }

    for (const entry of transactions) {
      this.#apply(new Transaction({ ...entry, cardId: id }));
    }
  }

  get id() {
    return this.#id;
  }

  get merchant() {
    return this.#merchant;
  }

  get originalBalance() {
    return this.#originalBalance;
  }

  get currentBalance() {
    return this.#currentBalance;
  }

  get expirationDate() {
    return this.#expirationDate === null ? null : new Date(this.#expirationDate);
  }

  get restrictions() {
    return this.#restrictions;
  }

  /** Expired takes precedence over Depleted, since an expired card is unusable either way. */
  get status() {
    if (this.isExpired()) return CardStatus.EXPIRED;
    if (this.#currentBalance === 0) return CardStatus.DEPLETED;
    return CardStatus.ACTIVE;
  }

  isExpired(at = new Date()) {
    return this.#expirationDate !== null && at > this.#expirationDate;
  }

  getBalance() {
    return this.#currentBalance;
  }

  hasSufficientBalance(amount) {
    return amount <= this.#currentBalance;
  }

  /** Returns a copy of the history so callers cannot alter the card's records. */
  getTransactionHistory() {
    return [...this.#transactions];
  }

  getDetails() {
    return {
      id: this.#id,
      merchant: this.#merchant,
      originalBalance: this.#originalBalance,
      currentBalance: this.#currentBalance,
      status: this.status,
      expirationDate: this.#expirationDate?.toISOString() ?? null,
      restrictions: [...this.#restrictions],
      transactionCount: this.#transactions.length,
    };
  }

  purchase(amount, description = '') {
    return this.#apply(new Transaction({ cardId: this.#id, type: TransactionType.PURCHASE, amount, description }));
  }

  refund(amount, description = '') {
    return this.#apply(new Transaction({ cardId: this.#id, type: TransactionType.REFUND, amount, description }));
  }

  /**
   * Validates a transaction against the card's rules and, only if every check
   * passes, updates the balance and records it. A rejected transaction throws
   * before any state changes.
   */
  #apply(transaction) {
    if (transaction.cardId !== this.#id) {
      throw new TransactionError('CARD_MISMATCH', `Transaction belongs to card ${transaction.cardId}, not ${this.#id}.`);
    }

    if (transaction.type === TransactionType.PURCHASE) {
      if (this.isExpired(transaction.timestamp)) {
        throw new TransactionError('CARD_EXPIRED', `Card ${this.#id} is expired and cannot be used for purchases.`);
      }
      if (this.#currentBalance === 0) {
        throw new TransactionError('CARD_DEPLETED', `Card ${this.#id} is depleted.`);
      }
      if (!this.hasSufficientBalance(transaction.amount)) {
        throw new TransactionError(
          'INSUFFICIENT_FUNDS',
          `Purchase of ${formatCents(transaction.amount)} exceeds available balance of ${formatCents(this.#currentBalance)}.`,
        );
      }
    } else if (this.#currentBalance + transaction.amount > this.#originalBalance) {
      // Refunds can only return money that was previously spent.
      throw new TransactionError(
        'REFUND_EXCEEDS_SPENT',
        `Refund of ${formatCents(transaction.amount)} would exceed the original balance of ${formatCents(this.#originalBalance)}.`,
      );
    }

    const newBalance = this.#currentBalance + transaction.balanceEffect;
    if (newBalance < 0) {
      throw new TransactionError('NEGATIVE_BALANCE', 'Transaction would result in a negative balance.');
    }

    this.#currentBalance = newBalance;
    this.#transactions.push(transaction);
    return transaction;
  }
}
