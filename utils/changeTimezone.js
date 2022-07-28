const changeTimezone = (tiempoEstimado) => {
    let date = new Date()
    let argDate = ""
    if(tiempoEstimado){
        date.setTime(date.getTime() + (Math.round(tiempoEstimado)*1000*60))
        argDate = date.toLocaleTimeString('es-AR', { timeZone: "America/Argentina/Mendoza" })
        console.log(argDate)
    }else{
        argDate = date.toLocaleString('es-AR', { timeZone: "America/Argentina/Mendoza" })
        console.log(argDate)    
    }
    return argDate
}

module.exports = changeTimezone