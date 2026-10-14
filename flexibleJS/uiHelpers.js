
//Copy code number to clipboard.
export async function copyGiftCardCode(cardNumber) {
    try {
        await navigator.clipboard.writeText(cardNumber);
        return true;
    } catch (error) {
        console.error("Unable to copy gift card code:", error);
        return false;
    }
}

//UI for button Barcode
export function toggleBarcode(barcodeElement, button) {
    const isHidden = barcodeElement.hidden;

    barcodeElement.hidden = !isHidden;

    button.textContent = isHidden
        ? "Hide Barcode"
        : "Show Barcode";
}
