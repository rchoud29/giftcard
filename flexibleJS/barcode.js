
export function generateBarcode(elementId, barcodeValue) {
    if (typeof JsBarcode === "undefined") {
        console.error("JsBarcode library is not loaded.");
        return;
    }

    JsBarcode("#" + elementId, barcodeValue, {
        format: "CODE128",
        lineColor: "#000000",
        width: 2,
        height: 80,
        displayValue: true,
        background: "#ffffff"
    });
}

// Generate a QR code
export function generateQRCode(elementId, qrValue) {
    if (typeof QRCode === "undefined") {
        console.error("QRCode library is not loaded.");
        return;
    }

    const container = document.getElementById(elementId);

    // Clear any previous QR code
    container.innerHTML = "";

    new QRCode(container, {
        text: qrValue,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}
