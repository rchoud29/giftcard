/*
 * Internal API layer to purchase giftcards
 */


//TODO: Good comments


import TremendousProvider from "./tremendousProvider.js";

const provider = new TremendousProvider();

const DEFAULT_CACHE_TTL = 60 * 60 * 1000; // 1hr ttl
let cachedCatalog = null;
let lastFetchTime = 0;

async function getCachedCatalog(ttl = DEFAULT_CACHE_TTL, 
								forceRefresh = false) {
	const now = Date.now();
	if (!cachedCatalog || forceRefresh || (now - lastFetchTime > ttl)) {
		cachedCatalog = await provider.getProducts();
		lastFetchTime = now
	}

	return cachedCatalog;
}

function clearCachedCatalog() {
	cachedCatalog = null;
	lastFetchTime = 0;
}

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

async function checkProducts(options = {}) {
	const {
		productId = null,
		name = null,
		price = null,
		minPrice = null,
		maxPrice = null,
		currency = null,
		forceRefresh = false,
		cacheTtl = DEFAULT_CACHE_TTL,
	} = options;

	const rawProducts = await getCachedCatalog(cacheTtl, forceRefresh);

	const formatted = rawProducts.map((p) => ({
		id: p.id,
		name: p.name,
		currency: p.currency_codes ? p.currency_codes.join(", ") : null,
		rawCurrency: p.currency_codes || [],
		skus: p.skus?.map((sku) => ({
			min: sku.min,
			max: sku.max,
		})) || [],
	}));
	
	return formatted.filter((p) => {
		if (productId && p.id !== productId) 
			return false;

		if (name && !p.name.toLowerCase().includes(name.toLowerCase())) 
			return false;

		if (currency && !currency.some((c) => 
				p.rawCurrency?.some((rc) => 
					c.toLowerCase() === rc.toLowerCase()))) 
			return false;
		
		if (price !== null) {
            const supportsPrice = p.skus.some(
                (sku) => (sku.min == null || price >= sku.min) && 
						 (sku.max == null || price <= sku.max)
            );
            if (!supportsPrice) return false;
        }

        if (minPrice !== null) {
            const supportsMin = p.skus.some((sku) => sku.max == null || 
													 sku.max >= minPrice);
            if (!supportsMin) return false;
        }

        if (maxPrice !== null) {
            const supportsMax = p.skus.some((sku) => sku.min == null ||
													 sku.min <= maxPrice);
            if (!supportsMax) return false;
        }

		return true
	}).map(({ rawCurrency, ...product }) => product);
}

export {
	buyGiftCard,
	checkProducts,
};
