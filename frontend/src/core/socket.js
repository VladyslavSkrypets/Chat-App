import { io } from 'socket.io-client';

const socket = io('localhost:5000');

socket.connect();

// socket.emit('connected')

// socket.on('test', (data) => console.log(data));
// console.log(JSON.parse(localStorage.getItem('user')))

export default socket;
