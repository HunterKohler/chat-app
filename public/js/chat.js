const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template')
    .innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template')
    .innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template')
    .innerHTML

// Options
const { room, username } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// Functions

function autoscroll() {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Socket Listeners
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.user.username,
        message: message.text,
        createdAt: moment(message.createdAt)
            .format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationMessageTemplate, {
        username: location.user.username,
        url: location.url,
        createdAt: moment(location.createdAt)
            .format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

// Event Listeners
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.message.value
    if (message === '') {
        return
    }

    $messageFormButton.disabled = true
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.disabled = false
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message sent!')
    })
})

$sendLocationButton.addEventListener('click', (e) => {
    $sendLocationButton.disabled = true

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    navigator
        .geolocation
        .getCurrentPosition(({ coords: { latitude, longitude } }) => {
            socket.emit('sendLocation', { latitude, longitude }, (error) => {
                $sendLocationButton.disabled = false

                if (error) {
                    return console.log(error)
                }

                console.log('Location shared!')
            })
        }, (error) => {
            alert('Could not fetch location.')
        })
})

socket.emit('join', { room, username }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})