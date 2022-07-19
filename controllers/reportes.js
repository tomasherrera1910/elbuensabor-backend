const reportesRouter = require('express').Router()
const Pedido = require('../models/Pedido')
const DetallePedido = require('../models/DetallePedido')
const User = require('../models/User')
const ArticuloInsumo = require('../models/ArticuloInsumo')
const formatDate = require('../utils/formatDate')

reportesRouter.get('/rankingComidas/:fechaDesde/:fechaHasta', async(req, res) => {
    const {params} = req
    const {fechaDesde, fechaHasta} = params
    if(!fechaDesde || !fechaHasta){
        return res.status(400).json({error:"Ingrese las dos fechas para crear el ranking."})
    }
    const dateDesde = new Date(fechaDesde)
    //EL INPUT DATE DEL FRONTEND VIENE CON UN DÍA MENOS ASI QUE LO AGREGAMOS
    dateDesde.setTime(dateDesde.getTime() + (1000*60*60*24))
    //SE SETEAN TODAS LAS HORAS EN 0 ASI PODEMOS COMPARAR LAS FECHAS SIN PREOCUPARNOS DE LA HORA
    dateDesde.setHours(0,0,0,0)
    const dateHasta = new Date(fechaHasta)
    dateHasta.setTime(dateHasta.getTime() + (1000*60*60*24))
    dateHasta.setHours(0,0,0,0)
        
    let rankingComidas = []
    const pedidos = await Pedido.find({})
        for(const pedido of pedidos){
            const fechaFormateada = formatDate(pedido.fecha)
            const datePedido = new Date(fechaFormateada || null)
            datePedido.setHours(0,0,0,0)
                
                if(datePedido >= dateDesde && datePedido <= dateHasta){
                    for(const detalle of pedido.detallesPedidos){
                        //Obtenemos los articulos pedidos en los pedidos que están entre las fechas indicadas
                        const comida = await DetallePedido.findById(detalle)
                        if(comida.tipoDeArticulo === 'manufacturado'){ //Solo se tomaran en cuenta para el ranking articulos manufacturados
                            let articuloEncontrado = false
                            for(const articulo of rankingComidas){ //Buscamos en el ranking si la comida ya fue agregada
                                if(articulo.comida === comida.articulo){
                                    let index = rankingComidas.findIndex(ranking => ranking.comida === articulo.comida)
                                    rankingComidas[index] = {comida: comida.articulo, cantidadPedida: (rankingComidas[index].cantidadPedida + comida.cantidad)}
                                    articuloEncontrado = true
                                    break
                                }
                            }
                            //Si no fue agregada aún la agregamos
                            if(!articuloEncontrado)
                            rankingComidas = rankingComidas.concat({comida:comida.articulo, cantidadPedida:comida.cantidad})
                            
                        }
                    }
                }
        }
    rankingComidas.sort(((a, b) => b.cantidadPedida - a.cantidadPedida))
    return res.json(rankingComidas)
})

reportesRouter.get('/rankingCantPedidos/:fechaDesde/:fechaHasta', async(req, res) => {
    const {params} = req
    const {fechaDesde, fechaHasta} = params
    if(!fechaDesde || !fechaHasta){
        return res.status(400).json({error:"Ingrese las dos fechas para crear el ranking."})
    }
    const dateDesde = new Date(fechaDesde)
    //EL INPUT DATE DEL FRONTEND VIENE CON UN DÍA MENOS ASI QUE LO AGREGAMOS
    dateDesde.setTime(dateDesde.getTime() + (1000*60*60*24))
    //SE SETEAN TODAS LAS HORAS EN 0 ASI PODEMOS COMPARAR LAS FECHAS SIN PREOCUPARNOS DE LA HORA
    dateDesde.setHours(0,0,0,0)
    const dateHasta = new Date(fechaHasta)
    dateHasta.setTime(dateHasta.getTime() + (1000*60*60*24))
    dateHasta.setHours(0,0,0,0) 
        
    let rankingPedidosPorUsuario = []
    const pedidos = await Pedido.find({})
        for(const pedido of pedidos){
            const fechaFormateada = formatDate(pedido.fecha)
            const datePedido = new Date(fechaFormateada || null)
            datePedido.setHours(0,0,0,0)
                if(datePedido >= dateDesde && datePedido <= dateHasta){
                    const user = await User.findById(pedido.user)
                    let userEncontrado = false
                    for(const usuario of rankingPedidosPorUsuario){
                        if(usuario.email === user.email){
                            let index = rankingPedidosPorUsuario.findIndex(ranking => ranking.email === usuario.email)
                            rankingPedidosPorUsuario[index] = {email: usuario.email, cantidadPedidos: (rankingPedidosPorUsuario[index].cantidadPedidos + 1)}
                            userEncontrado = true
                            break
                        }
                    }
                    //Si no fue agregada aún la agregamos
                    if(!userEncontrado)
                    rankingPedidosPorUsuario = rankingPedidosPorUsuario.concat({email:user.email, cantidadPedidos:1})
                }
        }
        rankingPedidosPorUsuario.sort(((a, b) => b.cantidadPedidos - a.cantidadPedidos))
    return res.json(rankingPedidosPorUsuario)
})

//INGRESOS -----------------------------------------------------------------------------------------------
reportesRouter.get('/ingresos/:fechaDesde/:fechaHasta', async(req, res) => {
    const {params} = req
    const {fechaDesde, fechaHasta} = params
    if(!fechaDesde || !fechaHasta){
        return res.status(400).json({error:"Ingrese las dos fechas para crear el ranking."})
    }
    const dateDesde = new Date(fechaDesde)
    //EL INPUT DATE DEL FRONTEND VIENE CON UN DÍA MENOS ASI QUE LO AGREGAMOS
    dateDesde.setTime(dateDesde.getTime() + (1000*60*60*24))
    //SE SETEAN TODAS LAS HORAS EN 0 ASI PODEMOS COMPARAR LAS FECHAS SIN PREOCUPARNOS DE LA HORA
    dateDesde.setHours(0,0,0,0)
    const dateHasta = new Date(fechaHasta)
    dateHasta.setTime(dateHasta.getTime() + (1000*60*60*24))
    dateHasta.setHours(0,0,0,0)  
    let fechasIngresos = []
    const pedidos = await Pedido.find({})
        for(const pedido of pedidos){
            const fechaFormateada = formatDate(pedido.fecha)
            const datePedido = new Date(fechaFormateada || null)
            datePedido.setHours(0,0,0,0)
                if(datePedido >= dateDesde && datePedido <= dateHasta){
                    let fechaEncontrada = false
                    for(const fechaIngreso of fechasIngresos){
                    if(fechaIngreso.fecha === datePedido.toLocaleDateString()){
                        let index = fechasIngresos.findIndex(date => date.fecha === fechaIngreso.fecha)
                        fechasIngresos[index] = {fecha: fechaIngreso.fecha, ingresos: fechasIngresos[index].ingresos + pedido.total}
                        fechaEncontrada = true
                        break
                    }
                }
                //Si no fue agregada aún la agregamos
                if(!fechaEncontrada)
                fechasIngresos = fechasIngresos.concat({fecha:datePedido.toLocaleDateString(), ingresos:pedido.total})
                }
            }
    return res.json(fechasIngresos)
})

//GANANCIAS-----------------------------------------------------------------------
reportesRouter.get('/ganancias/:fechaDesde/:fechaHasta', async(req, res) => {
    const {params} = req
    const {fechaDesde, fechaHasta} = params
    if(!fechaDesde || !fechaHasta){
        return res.status(400).json({error:"Ingrese las dos fechas para crear el ranking."})
    }
    const dateDesde = new Date(fechaDesde)
    //EL INPUT DATE DEL FRONTEND VIENE CON UN DÍA MENOS ASI QUE LO AGREGAMOS
    dateDesde.setTime(dateDesde.getTime() + (1000*60*60*24))
    //SE SETEAN TODAS LAS HORAS EN 0 ASI PODEMOS COMPARAR LAS FECHAS SIN PREOCUPARNOS DE LA HORA
    dateDesde.setHours(0,0,0,0)
    const dateHasta = new Date(fechaHasta)
    dateHasta.setTime(dateHasta.getTime() + (1000*60*60*24))
    dateHasta.setHours(0,0,0,0)
    
    let fechasGanancias = []
    const pedidos = await Pedido.find({})
        for(const pedido of pedidos){
                const fechaFormateada = formatDate(pedido.fecha)
                const datePedido = new Date(fechaFormateada || null)
                datePedido.setHours(0,0,0,0)
                
                if(datePedido >= dateDesde && datePedido <= dateHasta){
                    let fechaEncontrada = false
                    for(const fechaIngreso of fechasGanancias){
                    if(fechaIngreso.fecha === datePedido.toLocaleDateString()){
                        let index = fechasGanancias.findIndex(date => date.fecha === fechaIngreso.fecha)
                        fechasGanancias[index] = {...fechasGanancias[index], ingresos: fechasGanancias[index].ingresos + pedido.total}
                        fechaEncontrada = true
                        break
                    }
                }
                //Si no fue agregada aún la agregamos
                if(!fechaEncontrada)
                fechasGanancias = fechasGanancias.concat({fecha:datePedido.toLocaleDateString(), ingresos:pedido.total})
                }
            }
            
    const insumos = await ArticuloInsumo.find({})
        for(const insumo of insumos){
            if(insumo.fecha){
            const fechaFormateada = formatDate(insumo.fecha)
            const dateInsumo = new Date(fechaFormateada || null)
                dateInsumo.setHours(0,0,0,0)
            
            if(dateInsumo >= dateDesde && dateInsumo <= dateHasta){
                let fechaEncontrada = false
                for(const fechaIngreso of fechasGanancias){
                if(fechaIngreso.fecha === dateInsumo.toLocaleDateString()){
                    let index = fechasGanancias.findIndex(date => date.fecha === fechaIngreso.fecha)
                    
                    fechasGanancias[index] = {...fechasGanancias[index], gastos: (fechasGanancias[index].gastos || 0) + insumo.precioCompra}
                    fechaEncontrada = true
                    break
                }
            }
            //Si no fue agregada aún la agregamos
            if(!fechaEncontrada)
            fechasGanancias = fechasGanancias.concat({fecha:dateInsumo.toLocaleDateString(), gastos:insumo.precioCompra})
            }}
        }    
            //console.log(fechasGanancias)
    return res.json(fechasGanancias)
})

module.exports = reportesRouter