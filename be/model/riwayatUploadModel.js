import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const RiwayatUpload = db.define('riwayat_upload', {
  id_upload: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nama_file: {
    type: DataTypes.STRING,
    allowNull: false
  },
  kelas: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  tahun_ajaran: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  tanggal_upload: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  file_path: { // New column for storing the path to the uploaded file
    type: DataTypes.STRING,
    allowNull: true // Allow null initially, as older entries won't have this
  }
}, {
  tableName: 'riwayat_upload',
  timestamps: true, // Sequelize will manage createdAt and updatedAt
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default RiwayatUpload;