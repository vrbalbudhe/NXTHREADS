const socket = io('http://localhost:8000', {
    transports: ['websocket'],
  });
  
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
  