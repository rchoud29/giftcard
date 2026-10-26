import { randomUUID } from 'node:crypto';

export const TransactionType = Object.freeze({
  PURCHASE: 'purchase',
  REFUND: 'refund',
});

/** Error thrown when a transaction is invalid or rejected by a card's rules. */
export class TransactionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'TransactionError';
    this.code = code;
  }
}

/**
 * An immutable record of a single purchase or refund against a gift card.
 * Amounts are positive integer cents; the type determines the direction.
 */
export class Transaction {
  constructor({ id = `TXN-${randomUUID()}`, cardId, type, amount, description = '', timestamp = new Date() }) {
    if (typeof cardId !== 'string' || cardId.trim() === '') {
      throw new TransactionError('INVALID_CARD_ID', 'Transaction requires a gift card ID.');
    }
    if (!Object.values(TransactionType).includes(type)) {
      throw new TransactionError('INVALID_TYPE', `Unknown transaction type "${type}".`);
    }
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new TransactionError(
        'INVALID_AMOUNT',
        `Transaction amount must be a positive integer number of cents (received ${amount}).`,
      );
    }

    const time = new Date(timestamp);
    if (Number.isNaN(time.getTime())) {
      throw new TransactionError('INVALID_TIMESTAMP', `Invalid transaction timestamp "${timestamp}".`);
    }

    this.id = id;
    this.cardId = cardId;
    this.type = type;
    this.amount = amount;
    this.description = description;
    this.timestamp = time;
    Object.freeze(this);
  }

  /** Signed effect on the card balance: negative for purchases, positive for refunds. */
  get balanceEffect() {
    return this.type === TransactionType.PURCHASE ? -this.amount : this.amount;
  }

  toJSON() {
    return {
      id: this.id,
      cardId: this.cardId,
      type: this.type,
      amount: this.amount,
      description: this.description,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
