const addressRouter = require('express').Router()
const userExtractor = require('../middlewares/userExtractor')
const Address = require('../models/Address')
const User = require('../models/User')
addressRouter.get('/' , (req, res, next) => {
    Address.find({})
    .then(data => res.json(data))
    .catch(error => next(error))
})

addressRouter.get('/:id', (req, res, next) => {
    const {id} = req.params
    Address.find({user : id})
    .then(data => res.json(data))
    .catch(error => next(error))
})

addressRouter.post('/', userExtractor, async(req, res, next) => {
    const {body,userId} = req
    const {calle, numero, localidad} = body
    const user = await User.findById(userId)
    if(!user){
        return res.status(400).json({error:'Debe logearse para vincular su domicilio'})
    }
    if(!calle || !numero || !localidad){
        return res.status(400).json({error:'Todos los campos son obligatorios!'})
    }
    const newAddress = new Address({
        calle,
        numero,
        localidad,
        user: user._id
    })
    try{
        const savedAddress = await newAddress.save()
        user.addresses = user.addresses.concat(savedAddress._id)
        await user.save()
        res.status(201).json(savedAddress)
    }catch(error){
        next(error)
    }
   
})

addressRouter.put('/:id', (req, res, next) => {
    const {calle, numero, localidad} = req.body
    const {id} = req.params
    const updatedAddress = {
        calle,
        numero,
        localidad
    }
    Address.findByIdAndUpdate(id, updatedAddress, {new: true})
    .then(address => res.status(202).json(address))
    .catch(error => next(error))
})

addressRouter.delete('/:id', (req, res, next) => {
    const {id} = req.params
    Address.findByIdAndDelete(id)
    .then(() => res.status(204))
    .catch(error => next(error))
})

module.exports = addressRouter