/*
 * Internal API layer to purchase giftcards
 */

import TremendousProvider from "./tremendousProvider.js";

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

async function checkProducts(productId=Null) {
	const products = await provider.getProducts();

	const formatted = products.map((p) => ({
		id: p.id,
		name: p.name,
		currency: p.currency_codes ? 
				  p.currency_codes.join(", ") : Null,
		skus: p.skus?.map((sku) => ({
			min: sku.min,
			max: sku.max,
		})),
	}));
	return (productId) ? formatted.filter((p) => p.id == productId) : formatted
}

export {
	buyGiftCard,
	checkProducts,
};
