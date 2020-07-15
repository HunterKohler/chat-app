const users = []

class User {
    constructor(id, username, room) {
    	if (!username || !room) {
            return ({
                error: 'Username and room are required!'
            })
        }

    	this.id = id
        this.username = username.trim()
            .toLowerCase()
        this.room = room.trim()
            .toLowerCase()

        const existingUser = users.find((user) => {
            return user.username === this.username && user.room === this.room
        });

        if (existingUser) {
            return {
                error: 'Username is in user!'
            }
        }

        users.push(this)
    }
}

function add(id, username, room){
	return new User(id, username, room)
}

function remove(id){
	const index = users.findIndex((user) => user.id === id);

	if(index !== -1){
		return users.splice(index, 1)[0]
	}
}

function get(id){
	return users.find((user) => user.id === id)
}

function getRoom(room){
	room = room.trim().toLowerCase()
	return users.filter((user) => user.room === room)
}

module.exports = {
	add,
	remove,
	get,
	getRoom
}