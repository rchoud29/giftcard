const buyGiftCard = require("./giftCards.js")

async function test() {
	const response = await buyGiftCard({
		userId: "1",
		cardProductId: "OKM29281D608",
		amountCents: 2500,
		recipientEmail: "rchoud29@asu.edu",
		recipientName: "test",
	});

	console.log(response);
}

test();
