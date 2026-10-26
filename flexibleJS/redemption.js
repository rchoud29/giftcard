
/*
 * Flexible Gift Card Redemption
 * Simulated Redemption Helper
 */

// Determine gift card status
export function determineCardStatus(card) {
    if (card.balance <= 0) {
        return "Redeemed";
    }

    if (card.balance < card.originalBalance) {
        return "Partially Used";
    }

    return "Active";
}

// Simulate redeeming a gift card
export function redeemGiftCard(card, amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
        return {
            success: false,
            message: "Please enter a valid redemption amount."
        };
    }

    if (card.status === "Redeemed" ||
        card.status === "Expired" ||
        card.status === "Disabled") {
        return {
            success: false,
            message: "This gift card cannot be redeemed."
        };
    }

    // Work in cents to avoid floating-point errors
    const amountCents = Math.round(amount * 100);
    const balanceCents = Math.round(card.balance * 100);

    if (Math.abs(amount * 100 - amountCents) > 0.000001) {
        return {
            success: false,
            message: "Enter an amount with no more than two decimal places."
        };
    }

    if (amountCents > balanceCents) {
        return {
            success: false,
            message: "Insufficient gift card balance."
        };
    }

    // Create an updated copy instead of modifying the original
    const updatedCard = {
        ...card,
        balance: (balanceCents - amountCents) / 100
    };

    updatedCard.status = determineCardStatus(updatedCard);

    return {
        success: true,
        message: "Gift Card Redeemed Successfully!",
        amountUsed: amountCents / 100,
        remainingBalance: updatedCard.balance,
        updatedCard
    };
}
