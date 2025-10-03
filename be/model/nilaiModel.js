import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Siswa from "./siswaModel.js";
import MataPelajaran from "./mapelModel.js";

const { DataTypes } = Sequelize;

const Nilai = db.define(
  "nilai",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    siswa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mapel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    semester: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    tahun_ajaran: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    nilai: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Define associations
Siswa.hasMany(Nilai, { foreignKey: "siswa_id", as: "nilai" });
Nilai.belongsTo(Siswa, { foreignKey: "siswa_id", as: "siswa" });

MataPelajaran.hasMany(Nilai, { foreignKey: "mapel_id", as: "nilai_mapel" });
Nilai.belongsTo(MataPelajaran, { foreignKey: "mapel_id", as: "mata_pelajaran" });

export default Nilai;
