import {buyGiftCard, checkProducts} from "./giftCards.js";

const productId = "SUCNT639A6H9";
let card = await checkProducts(productId);

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

testPurchase();
