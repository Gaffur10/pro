import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import db from "./config/database.js";

// Import models
import User from "./model/userModel.js";
import Siswa from "./model/siswaModel.js";
import nilai_Siswa from "./model/nilai_siswa.js";
import hasil_cluster from "./model/hasil.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import siswaRoutes from "./routes/siswaRoutes.js";
import nilaiRoutes from "./routes/nilaiRoutes.js";
import clusteringRoutes from "./routes/clusteringRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || 5000;

// Database connection
try {
  await db.authenticate();
  console.log('Database connection has been established successfully.');
  
  // Force sync for development (WARNING: This will drop existing tables)
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Force syncing database...');
    await db.sync({ force: true });
    console.log('Database tables recreated successfully.');
  } else {
    // Sync all models without force
    await User.sync();
    await Siswa.sync();
    await nilai_Siswa.sync();
    await hasil_cluster.sync();
    console.log('All models synchronized successfully.');
  }
  
  // Check if we need to seed initial data
  const userCount = await User.count();
  if (userCount === 0) {
    console.log('No users found. Seeding initial data...');
    const { seedInitialData } = await import('./seeders/initialData.js');
    await seedInitialData();
  }
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/nilai', nilaiRoutes);
app.use('/api/clustering', clusteringRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});