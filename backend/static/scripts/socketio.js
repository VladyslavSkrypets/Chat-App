document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);




    socket.on('connect', function() {
        console.log('user connected!')
        socket.emit('connected');
    });

    // socket.on('disconnect', function() {
    //     console.log('user disconnected!')
    //     socket.emit('disconnect');
    // });

    // Retrieve username
    console.log(username);


    const default_room = "";
    let CURRENT_ROOM = default_room;

    // Send messages
    document.querySelector('#send_message').onclick = () => {
        console.log({'msg': document.querySelector('#user_message').value,
            'username': username, 'room': CURRENT_ROOM});
        socket.emit('incoming-msg', {'msg': document.querySelector('#user_message').value,
            'username': username, 'room': CURRENT_ROOM});

        document.querySelector('#user_message').value = '';
    };

    document.querySelector('#create_room').onclick = () => {
        let data = {
             "room_name": document.querySelector('#room_name').value,
             "members": [{"user_id": document.querySelector('#user_id_1').value}, {"user_id": document.querySelector('#user_id_2').value}]
        }
        socket.emit('room-create', data);
    }
    document.querySelector('#edit_room').onclick = () => {
         let data = {
             "room_name": document.querySelector('#room_name').value,
             "members": [{"user_id": document.querySelector('#user_id_1').value}, {"user_id": document.querySelector('#user_id_2').value}]
        }
        socket.emit('room-edit', data);
    }



    socket.on('room-created', async () => {
        const request = await fetch("http://127.0.0.1:5000/chats");
        const response = await request.json();
        const roomList = document.querySelector('#rooms__list')
        roomList.innerHTML = response.map((room) => `<p onclick="roomClickEvent(this);" class="select-room">${room['name']}</p>`).join('')
        console.log(response);
    })

    socket.on('user_re_joined', (data) => {
        CURRENT_ROOM = data['new_room'];
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
        if (newRoom === CURRENT_ROOM) {
            let msg = `You are already in ${CURRENT_ROOM} room.`;
            printSysMsg(msg);
        } else {
            if (CURRENT_ROOM !== default_room) {
                leaveRoom(CURRENT_ROOM);
                console.log('leave')
            }
            joinRoom(newRoom);
            CURRENT_ROOM = newRoom;
            console.log('new room is ', CURRENT_ROOM)
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


    // window.addEventListener('beforeunload', async function (e) {
    //   // Cancel the event
    //
    //   e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
    //   // Chrome requires returnValue to be set
    //     const response = await fetch('http://127.0.0.1:5000/test-page-close');
    //     const data = await response.json();
    //     console.log(data);
    // });

})