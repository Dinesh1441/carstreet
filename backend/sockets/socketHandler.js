const socketHandler = (io) => {
  io.on('connection', (socket) => {
    // console.log('A user connected:', socket.id);
    // socket.on('send_message', (data) => {
    //   io.emit('receive_message', data);
    // });
    // ... other event handlers
  });
};

// Export the function
export default socketHandler; // <-- Use 'export default'