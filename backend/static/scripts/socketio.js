document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', function() {
        console.log('user connected!')
        socket.emit('connected');
    });
    socket.on('disconnect', function() {
        console.log('user disconnected!')
        socket.emit('disconnect');
    });

    // Retrieve username
    console.log(username);


    const default_room = "";
    let room = default_room;

    // Send messages
    document.querySelector('#send_message').onclick = () => {
        socket.emit('incoming-msg', {'msg': document.querySelector('#user_message').value,
            'username': username, 'room': room});

        document.querySelector('#user_message').value = '';
    };

    document.querySelector('#create_room').onclick = () => {
        let data = {
             "room_name": document.querySelector('#room_name').value,
             "members": [{"user_id": "1f1e85b1-c155-4a8f-9c90-6eacb1e59732"}, {"user_id": "f666ef3b-e127-4812-b475-229ba51a529c"}]
        }
        socket.emit('room-create', data);
    }
    socket.on('room-created', async () => {
        const request = await fetch("http://localhost:5000/chats");
        const response = await request.json();
        const roomList = document.querySelector('#rooms__list')
        roomList.innerHTML = response.map((room) => `<p onclick="roomClickEvent(this);" class="select-room">${room['name']}</p>`).join('')
        console.log(response);
    })

    // Display incoming messages
    socket.on('message', data => {
        console.log(data);

        const text = data['msg']['text'];
        console.log('received a new message', text);
        const p = document.createElement('p');
        const span_username = document.createElement('span');
        const span_ts = document.createElement('span');
        const br = document.createElement('br');

        if (typeof data.username !== 'undefined') {
            span_username.innerHTML = data.username;
            span_ts.innerHTML = data.time;
            p.innerHTML = span_username.outerHTML + br.outerHTML + text + br.outerHTML + span_ts.outerHTML;
            document.querySelector('#display-message-section').append(p);
            console.log('hit username')
        } else {
            console.log('hit simple')
            printSysMsg(data.msg.text);
        }

    });



    // Select a room
    document.querySelectorAll('.select-room').forEach(p => {
        p.onclick = () => {
            roomClickEvent(p)
        };
    });

    // document.querySelector('#send_socket').addEventListener('click', () => {
    //     let point = document.querySelector('#socketPoint').value;
    //     let data = document.querySelector('#dataArea').value;
    //     sendCreateData(point, data);
    // })

    function roomClickEvent (nRoom) {
        let newRoom = nRoom.innerHTML
        // Check if user already in the room
        if (newRoom === room) {
            let msg = `You are already in ${room} room.`;
            printSysMsg(msg);
        } else {
            if (room !== default_room) {
                leaveRoom(room);
                console.log('leave')
            }
            joinRoom(newRoom);
            room = newRoom;
            console.log('new room is ', room)
        }
    }


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