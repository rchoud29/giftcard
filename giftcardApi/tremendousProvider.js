class TremendousProvider {
	//TODO: Implement .env to hide keys
	constructor() {
		//testflight url
		this.baseUrl = "https://testflight.tremendous.com/api/v2"
		this.apiKey = "TEST_wnY6pswmM--iTvSVG7d7xacnqS2LYxavniinJ0G3P8N";
	}

	async request(endpoint, options = {}) {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			...options,
			headers: {
				"Authorization": `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
				...options.headers,
			},
		});

		if (!response.ok) {
			const err = await response.json().catch(() => ({}));
			throw new Error(`Tremendous API Error [${response.status}]: \
							 ${JSON.stringify(err)}`);
		}

		return response.json();
	}

	/*
	 * Execute gift card purchase
	 */
	async purchase({ productId, amountCents, currency = "USD",
					 recipientEmail, recipientName, externalRefId }) {
		const payload = {
			external_id: externalRefId,
			payment: {
				funding_source_id: "balance" //TODO use real money
			},
			reward: {
				value: {
					denomination: amountCents / 100,
					currency_code: currency,
				},
				delivery: {
					method: "email", //TODO handle ourselves?
				},
				recipient: {
					name: recipientName,
					email: recipientEmail,
				},
				products: [productId],
			},
		};

		const data = await this.request("/orders", {
			method: "POST",
			body: JSON.stringify(payload),
		});

		const order = data.order;
		const reward = order.rewards?.[0];

		return {
			vendorOrderId: order.id,
			//TODO enums?
			status: order.status === "EXECUTED" ? "SUCCESS" : "PENDING",
			rewardUrl: reward?.delivery?.link || null,
			response: data,
		};
	}

	async getProducts() {
		const data = await this.request("/products");
		return data.products;
	}
}

module.exports = TremendousProvider;
