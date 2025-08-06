import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Siswa from "./siswaModel.js";

const { DataTypes } = Sequelize;
const nilai_Siswa = db.define(
  "nilai_siswa",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    siswa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Siswa,
        key: "id",
      },
    },
    semester: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    tahun_ajaran: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    Matematika: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    PKN: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    Seni_Budaya: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    ipa: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    Bahasa_Indonesia: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    Bahasa_Inggris: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    PJOK: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    IPS: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    Pend_Agama: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    TIK: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    rata_rata: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  },
  { 
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Hubungkan relasi
Siswa.hasMany(nilai_Siswa, { foreignKey: "siswa_id", as: "nilai" });
nilai_Siswa.belongsTo(Siswa, { foreignKey: "siswa_id", as: "siswa" });

export default nilai_Siswa;