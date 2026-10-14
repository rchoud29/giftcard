
export const sampleGiftCard = {
    id: 1,
    merchant: "Demo Store",
    cardNumber: "1234567890123456",
    pin: "1234",
    balance: 50.00,
    originalBalance: 50.00,
    status: "Active",
    barcodeValue: "1234567890123456",
    redemptionMethods: ["barcode", "online"],
    instructions: {
        inStore: "Show the barcode to the cashier.",
        online: "Enter the gift card code at checkout."
    }
};

// Get the current balance
export function getBalance(card) {
    return card.balance;
}

// Get the gift card status
export function getStatus(card) {
    return card.status;
}

// Check if the gift card is active
export function isCardActive(card) {
    return card.balance > 0 && card.status !== "Redeemed";
}

// Hide most of the gift card number
export function maskCardNumber(cardNumber) {
    return "•••• •••• •••• " + cardNumber.slice(-4);
}
