class Message {
    constructor(text, user = {username: 'Admin'}) {
        this.user = user
        this.text = text
        this.createdAt = new Date()
            .getTime()
    }
}

class Location {
    constructor({ latitude, longitude }, user = {username: 'Admin'}) {
        this.user = user
        this.latitude = latitude
        this.longitude = longitude
        this.url = `https://google.com/maps?q=${latitude},${longitude}`
        this.createdAt = new Date()
            .getTime();
    }
}

module.exports = {
    Message,
    Location
}