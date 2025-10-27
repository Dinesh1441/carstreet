// index.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config'; // Different way to load dotenv with ES modules
import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; // Socket.io uses named exports
import connectDB from './config/db.js'; // Note the .js extension is MANDATORY
import socketHandler from './sockets/socketHandler.js'; // .js extension is MANDATORY
import userRoutes from './routes/userRoutes.js';
import path from 'path';
import cors from 'cors';
import leadRoutes from './routes/leadRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import carRoutes from './routes/carRoutes.js';
import makeRoutes from './routes/makeRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import variantRoutes from './routes/variantRoutes.js';
import stateRoutes from './routes/stateRoutes.js';
import buyopportunityRoutes from './routes/buyopportunityRoute.js';
import financeOpportunityRoutes from './routes/financeopportunityRoutes.js';
import insuranceOpportunityRoutes from './routes/insuranceopportunityRoutes.js';
import rtoOpportunityRoutes from './routes/rtoopportunityRoutes.js';
import tastRoutes from './routes/taskRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import sellopportunityRoute from './routes/sellopportunityRoute.js';
import deliveryRouter from './routes/deliveryRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import salesdashboardRoutes from './routes/salesdashboardRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"], 
    credentials: true
  },
  pingTimeout: 60000,
});

app.set('io', io);
// Connect to Database




connectDB();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Basic Express route
app.get('/', (req, res) => {
  res.json({ message: 'Express + Socket.io server is running with ES Modules!' });
});



// Initialize socket handling
socketHandler(io);

// app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/makes', makeRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/state', stateRoutes);
app.use('/api/buyopportunity', buyopportunityRoutes);
app.use('/api/financeopportunity', financeOpportunityRoutes);
app.use('/api/insuranceopportunity', insuranceOpportunityRoutes);
app.use('/api/rtoopportunity', rtoOpportunityRoutes);
app.use('/api/sellopportunity', sellopportunityRoute);
app.use('/api/task', tastRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/city', cityRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/salesdashboard', salesdashboardRoutes);
app.use('/api/api-keys', apiRoutes);


// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 