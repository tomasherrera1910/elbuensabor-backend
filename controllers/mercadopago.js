const mercadopago = require('mercadopago')
const mercadopagoRouter = require('express').Router()

mercadopago.configure({
	access_token: process.env.CREDENTIAL_MERCADOPAGO,
})

mercadopagoRouter.post("/", (req, res) => {
    const {body} = req
    const {articulos, total} = body
	
	let preference = {
		items: [
			{
				title: articulos,
				description: "El buen sabor",
				unit_price: Number(total),
				quantity: 1,
			}
		],
		back_urls: {
			"success": "https://elbuensabor-herrera.netlify.app/pedido/susPedidos",
			"failure": "https://elbuensabor-herrera.netlify.app/pedido/susPedidos",
			"pending": "https://elbuensabor-herrera.netlify.app/pedido/susPedidos"
		},
		auto_return: "approved",
	}

	mercadopago.preferences.create(preference)
		.then(function (response) {
			res.json({preferenceId:response.body.id})
		}).catch(function (error) {
			console.log(error);
		});
})
mercadopagoRouter.get('/feedback', function(req, res) {
	res.json({
		Payment: req.query.payment_id,
		Status: req.query.status,
		MerchantOrder: req.query.merchant_order_id
	})
})
module.exports = mercadopagoRouter