import { Wallet } from './src/Wallet.js';
import { GiftCard } from './src/GiftCard.js';
import { createSampleCards } from './src/sampleData.js';
import { formatCents } from './src/money.js';

function heading(title) {
  console.log(`\n=== ${title} ===`);
}

function printCards(wallet) {
  for (const card of wallet.listCards()) {
    console.log(
      `  ${card.id.padEnd(12)} ${card.merchant.padEnd(10)} ${formatCents(card.getBalance()).padStart(9)}` +
        `  of ${formatCents(card.originalBalance).padStart(8)}  [${card.status}]`,
    );
  }
}

function printHistory(transactions) {
  if (transactions.length === 0) {
    console.log('  (no transactions)');
    return;
  }
  for (const txn of transactions) {
    const sign = txn.type === 'purchase' ? '-' : '+';
    console.log(
      `  ${txn.timestamp.toISOString().slice(0, 10)}  ${txn.type.padEnd(8)} ${(sign + formatCents(txn.amount)).padStart(9)}  ${txn.description}`,
    );
  }
}

// 1-2. Create a wallet and load the sample cards.
const wallet = new Wallet();
wallet.addCards(createSampleCards());

// 3. All cards and balances.
heading(`Wallet cards (${wallet.size})`);
printCards(wallet);

// 4. Total wallet balance.
heading('Total wallet balance');
console.log(`  Usable (excludes expired): ${formatCents(wallet.getTotalBalance())}`);
console.log(`  Including expired:         ${formatCents(wallet.getTotalBalance({ includeExpired: true }))}`);

// 5-7. Retrieve one card and show its details and history.
const target = wallet.getCard('GC-TGT-0001');
heading(`Card details: ${target.merchant} (${target.id})`);
console.log(`  Status:       ${target.status}`);
console.log(`  Balance:      ${formatCents(target.getBalance())} of ${formatCents(target.originalBalance)}`);
console.log(`  Expires:      ${target.expirationDate?.toISOString().slice(0, 10) ?? 'Never'}`);
console.log('  Restrictions:');
for (const restriction of target.restrictions) console.log(`    - ${restriction}`);
console.log('  Transaction history:');
printHistory(target.getTransactionHistory());

// 8. Add a new card.
heading('Add a new card');
const apple = wallet.addCard(
  new GiftCard({
    id: 'GC-APL-0006',
    merchant: 'Apple',
    originalBalance: 5000,
    expirationDate: null,
    restrictions: ['Apple Store and App Store purchases'],
  }),
);
console.log(`  Added ${apple.merchant} card ${apple.id} with ${formatCents(apple.getBalance())}.`);

// 9. Remove a card.
heading('Remove a card');
const removed = wallet.removeCard('GC-WMT-0004');
console.log(`  Removed ${removed.merchant} card ${removed.id} [${removed.status}].`);
printCards(wallet);
console.log(`  Total usable balance: ${formatCents(wallet.getTotalBalance())}`);

// 10. Simulated purchase.
heading(`Purchase on ${target.merchant} card`);
const txn = wallet.purchase(target.id, 1599, 'Board game');
console.log(`  Approved ${txn.id}: ${formatCents(txn.amount)} for "${txn.description}".`);

try {
  wallet.purchase(target.id, 100000, 'Television');
} catch (error) {
  console.log(`  Declined: ${error.message}`);
}

// 11. Updated balance and history.
heading(`Updated ${target.merchant} card`);
console.log(`  Balance: ${formatCents(wallet.getCardBalance(target.id))} [${target.status}]`);
console.log('  Transaction history:');
printHistory(wallet.getTransactionHistory(target.id));
console.log(`\n  Total usable wallet balance: ${formatCents(wallet.getTotalBalance())}\n`);
