const socket = io('/')

const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video');
myVideo.muted = true;

// create new peer connection
// undefined is specifying that we don't need a specific id as of now.
var peer = new Peer(undefined, {
    host: "peerjs-server.herokuapp.com",
    secure: true,
    port: '443'
});


let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    })

    let text = $('input')
    //We making a function which will listen or observe if a key(enter mostly)
    // was pressed by the user to send the message
    // so here we are making a function to to hear or see that the enter key was pressed or not.
    $('html').keydown(function (e) {
        // 13 is the specific key number of enter key
        //  since we want to see if enter was pressed or not so
        // we used its key value
        // also we dont want to send an empty text
        // so we are putting these two conditions
        if (e.which == 13 && text.val().length !== 0) {            // emit function sends the message
            socket.emit('message', text.val());
            // after the user enters input then it has already been sent
            // we dont want the message container to still have that message
            // so message container needs to be cleared
            text.val('')
        }
    })

    // message sent by user 1 should be received by user 2
    socket.on('createMessage', message => {
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`)
    })
})

// Here we are saying that we have joined the room
// and passed on the id to it
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})


// User 2 called user 1 and so his video is getting tranferred here.
// Pay attention here, user 2 has not answered any thing till now so he will
// not see user 1's video.
const connectToNewUser = (userId, stream) => {
    // User 2 is calling user 1 with his video stream
    const call = peer.call(userId, stream)
    // creating the said above's video stream
    const video = document.createElement('video')
    // when user 1 gets recieve the video stream then he adds it
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

// Here d is the representing the div element under the message class made in room.ejs file
const scrollToBottom = () => {
    let d = $('.main__chat_window');
    // this d is then taking the required functions so that the message part can only scroll.
    d.scrollTop(d.prop("scrollHeight"));
}

// function to mute and unmute the mic button 
// which was made in the controls section
const muteUnmuteButton = () => {
    // get out current stream (myVideoStream)
    // we are going to get the current enabled audio section
    // of the audio track
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    // if audio track is enabled then it will be disabled
    // else it will be enabled from disable state
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span> 
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

// Video button enabled / disabled function logic
const playStopVideo = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}