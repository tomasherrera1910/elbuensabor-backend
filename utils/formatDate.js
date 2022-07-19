const formatDate = (fechaString) => {
    const fechaArray = Array.from(fechaString)
    let primerBarra = false
    let segundaBarra = false
    let dia = ''
    let mes = ''
    let año = ''
    for(const numero of fechaArray){
        if(numero !== '/' && !primerBarra && !segundaBarra){
            dia = `${dia}${numero}`
        }
        else if(numero !== '/' && primerBarra && !segundaBarra){
            mes = `${mes}${numero}`
        }
        else if(numero !== '/' && primerBarra && segundaBarra){
            año = `${año}${numero}`
        }
        else if(numero === '/' && !primerBarra){
            dia = `${dia}${numero}`
            primerBarra = true
        }
        else if(numero === '/' && primerBarra){
            mes = `${mes}${numero}`
            segundaBarra = true
        }
    }
    return `${mes}${dia}${año}`
}

module.exports = formatDate