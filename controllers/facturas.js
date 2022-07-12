const facturasRouter = require('express').Router()
const Factura = require('../models/Factura')
const Pedido = require('../models/Pedido')
const User = require ('../models/User')
const nodemailer = require("nodemailer")

facturasRouter.post('/', async(req,res,next) => {
    const {body} = req
    const {formaPago, pedido} = body
    if(!formaPago || !pedido){
        return res.status(400).json({error:'Faltan datos para crear la factura.'})
    }
    let pedidoAsociado = await Pedido.findById(pedido)
    let totalPedido = pedidoAsociado.total
    let montoDescuento = pedidoAsociado.tipoEnvio === 'Retiro en el local' ? (((totalPedido * 100) / 90) * 0.10) : 0
    const fecha = new Date()
    const facturas = await Factura.find({})
    const nroFactura = facturas.length || 1
    const newFactura = new Factura({
        fecha: fecha.toLocaleDateString(),
        numero: nroFactura,
        montoDescuento,
        formaPago,
        pedido
    })
    //enviar factura al cliente por gmail
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: 'elbuensabor.2022.lab4@gmail.com', // generated ethereal user
          pass: process.env.GMAIL_CREDENTIAL, // generated ethereal password
        },
      });
      const usuario = await User.findById(pedidoAsociado.user)
      // send mail with defined transport object
        await transporter.sendMail({
        from: '"EL BUEN SABOR" <elbuensabor.2022.lab4@gmail.com>', // sender address
        to: usuario.email, // list of receivers
        subject: "Gracias por comprar en el buen sabor", // Subject line
        html: `
        <div>
            <p>fecha: ${fecha.toLocaleDateString()}</p>
            <p>Número factura: ${nroFactura}</p>
            <p>metódo de pago: ${formaPago}</p>
            <p>total: $${pedidoAsociado.total}</p>
            <p>descuento: $${montoDescuento}</p>
            <b>Muchas gracias por comprar, recuerde que puede descargar todas sus facturas en la sección de Sus Pedidos</b>
        </div>        
        `, // html body
      })
    try {
        const savedFactura = await newFactura.save()
        pedidoAsociado.factura = savedFactura._id
        await pedidoAsociado.save()
        res.status(201).json(savedFactura)
    } catch (error) {
        next(error)
    }
})

module.exports = facturasRouter