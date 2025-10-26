const socketHandler = (io) => {
  io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('disconnect', (reason) => {
    console.log('❌ User disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

console.log('✅ Socket.io server initialized');
};

// Export the function
export default socketHandler; // <-- Use 'export default'