import {buyGiftCard, checkProducts} from "./giftCards.js";

const productId = "SUCNT639A6H9";

async function testPurchase() {
	const response = await buyGiftCard({
		userId: "1",
		productId: productId,
		amountCents: 2500,
		recipientEmail: "rchoud29@asu.edu",
		recipientName: "test",
	});

	console.log(response);
}

async function testSearch() {
	const options = {
		currency: ["USD"],
	}
	const response = await checkProducts(options);

	console.log(response);
}

await testPurchase();
await testSearch();
