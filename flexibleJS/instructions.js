// Default online redemption instructions
const defaultInstructions = [
    "Open your gift card from your digital wallet.",
    "Click Copy Code to copy your gift card number.",
    "Visit the merchant's website.",
    "Add the items you want to purchase to your cart.",
    "Proceed to checkout.",
    "Select Gift Card as your payment method, if available.",
    "Paste your gift card code and enter the PIN if required.",
    "Complete checkout and check your remaining balance."
];

// Get online redemption instructions
export function getRedemptionInstructions(card = null) {

    // Check for merchant-specific instructions
    const custom = card?.instructions?.online;

    if (Array.isArray(custom) && custom.length > 0) {
        return custom;
    }

    if (typeof custom === "string" && custom.trim()) {
        return [custom];
    }

    return defaultInstructions;
}

// Display online redemption instructions
export function displayRedemptionInstructions(
    elementId,
    card = null
) {
    const container = document.getElementById(elementId);

    if (!container) {
        console.error("Instructions container not found.");
        return;
    }

    const instructions = getRedemptionInstructions(card);

    container.replaceChildren();

    const list = document.createElement("ol");

    instructions.forEach(instruction => {
        const item = document.createElement("li");
        item.textContent = instruction;
        list.appendChild(item);
    });

    container.appendChild(list);
}
