document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    let room = "Lounge"
    joinRoom("Lounge");
    // Display incoming messages
    socket.on('message', data => {

        console.log('received a new message', data['msg'])
        const p = document.createElement('p');
        const span_username = document.createElement('span');
        const span_ts = document.createElement('span');
        const br = document.createElement('br');

        if (document.username) {
            span_username.innerHTML = data.username;
            span_ts.innerHTML = data.time;
            p.innerHTML = span_username.outerHTML + br.outerHTML + data.msg + br.outerHTML + span_ts.outerHTML;
            document.querySelector('#display-message-section').append(p);
        } else {
            printSysMsg(data.msg);
        }

    });
    socket.on('room-created', data => {
        console.log(data);
    })
    // Send messages
    document.querySelector('#send_message').onclick = () => {
        socket.emit('incoming-msg', {'msg': document.querySelector('#user_message').value,
            'username': username, 'room': room});

        document.querySelector('#user_message').value = '';
    };

    // Select a room
    document.querySelectorAll('.select-room').forEach(p => {
        p.onclick = () => {
            let newRoom = p.innerHTML
            // Check if user already in the room
            if (newRoom === room) {
                let msg = `You are already in ${room} room.`;
                printSysMsg(msg);
            } else {
                leaveRoom(room);
                joinRoom(newRoom);
                room = newRoom;
            }
        };
    });

    document.querySelector('#send_socket').addEventListener('click', () => {
        let point = document.querySelector('#socketPoint').value;
        let data = document.querySelector('#dataArea').value;
        sendCreateData(point, data);
    })


    async function leaveRoom(room) {
        let resp = await socket.emit('leave', {'username': username, 'room': room});
        console.log(resp)
    }

    function joinRoom(room) {
        socket.emit('join', {'username': username, 'room': room});
        document.querySelector('#display-message-section').innerHTML = '';
    }

    function printSysMsg(msg) {
        const p = document.createElement('p');
        p.innerHTML = msg;
        document.querySelector('#display-message-section').append(p);
    }

    const sendCreateData = (socketPoint, data) => {
        console.log(data);
        socket.emit(socketPoint, JSON.parse(data));
    }

})