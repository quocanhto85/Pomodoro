// server.ts
import { createServer } from 'http';
import { parse } from 'url';
import { Server as SocketServer } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketServer(server);

  // Handle server shutdown
  const handleShutdown = () => {
    console.log('Server shutting down, notifying clients...');
    io.emit('server-shutdown');
    
    // Give clients some time to process the event
    setTimeout(() => {
      process.exit(0);
    }, 100);
  };

  // Listen for shutdown signals
  process.on('SIGINT', handleShutdown);  // Ctrl+C
  process.on('SIGTERM', handleShutdown); // Kill command

  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});