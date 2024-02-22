

//assume dateString is UTC
export function toLocalISOString(dateString=null) {

    var d = dateString === null ? new Date() : new Date(dateString);    
    d = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return d.toISOString().slice(0, 19).replace(',', '') 

}



export function toLocalDateTime (dateString) {

    if (dateString.substr(-1,1)=='Z') { //UTC
        let d = new Date(dateString)
        return d.toLocaleDateString() + '  ' + new Date(dateString).toLocaleTimeString()
    } else
        return dateString
}

export function displayTime (tin) {
    let negative = false
    if (tin< 0) {
        tin = 0 - tin
        negative = true
    }

    let timeString = Math.floor(tin / 3600).toString().padStart(2, "0") + ":" +
    (Math.floor(tin / 60)  % 60).toString().padStart(2, "0") 
    + ':' + (tin % 60).toString().padStart(2, "0");

    return {timeString: timeString, negative: negative}
}