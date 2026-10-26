import { GiftCard, CardStatus } from './GiftCard.js';

/** Manages a collection of GiftCard objects keyed by card ID. */
export class Wallet {
  #cards = new Map();

  addCard(card) {
    if (!(card instanceof GiftCard)) {
      throw new TypeError('Only GiftCard instances can be added to a wallet.');
    }
    if (this.#cards.has(card.id)) {
      throw new Error(`A gift card with ID ${card.id} already exists in this wallet.`);
    }
    this.#cards.set(card.id, card);
    return card;
  }

  addCards(cards) {
    for (const card of cards) this.addCard(card);
  }

  /** Removes and returns the card with the given ID. */
  removeCard(cardId) {
    const card = this.getCard(cardId);
    this.#cards.delete(cardId);
    return card;
  }

  hasCard(cardId) {
    return this.#cards.has(cardId);
  }

  getCard(cardId) {
    const card = this.#cards.get(cardId);
    if (!card) {
      throw new Error(`No gift card with ID ${cardId} exists in this wallet.`);
    }
    return card;
  }

  listCards() {
    return [...this.#cards.values()];
  }

  get size() {
    return this.#cards.size;
  }

  getCardBalance(cardId) {
    return this.getCard(cardId).getBalance();
  }

  /**
   * Sum of card balances in cents. Expired cards are excluded by default
   * because their remaining funds cannot be spent.
   */
  getTotalBalance({ includeExpired = false } = {}) {
    let total = 0;
    for (const card of this.#cards.values()) {
      if (!includeExpired && card.status === CardStatus.EXPIRED) continue;
      total += card.getBalance();
    }
    return total;
  }

  getTransactionHistory(cardId) {
    return this.getCard(cardId).getTransactionHistory();
  }

  purchase(cardId, amount, description) {
    return this.getCard(cardId).purchase(amount, description);
  }

  refund(cardId, amount, description) {
    return this.getCard(cardId).refund(amount, description);
  }
}
