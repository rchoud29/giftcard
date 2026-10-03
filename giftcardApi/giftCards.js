/*
 * Internal API layer to purchase giftcards
 */

const TremendousProvider = require("./tremendousProvider.js");

const provider = new TremendousProvider();

async function buyGiftCard({ userId, productId, amountCents, 
							 recipientEmail, recipientName }) {
	const externalRefId = `ORD_${Date.now()}_${userId}`;

	try {
		const result = await provider.purchase({
			productId,
			amountCents,
			currency: "USD",
			recipientEmail,
			recipientName,
			externalRefId,
		});

		return {
			success: result.status === "SUCCESS",
			vendorOrderId: result.vendorOrderId,
			rewardUrl: result.rewardUrl,
		};
	} catch (err) {
		console.error(`Failed to complete gift card purchase:`, err.message);
		return {
			success: false,
			error: err.message
		};
	}
}

module.exports = buyGiftCard
