const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("KategoriLembur", {
    id_kategori_lembur: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kode_kategori: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    nama_kategori: { type: DataTypes.STRING(150), allowNull: false },
    jenis_mode: { type: DataTypes.ENUM("NONE", "OPTIONAL", "REQUIRED"), allowNull: false, defaultValue: "REQUIRED" },
    urutan: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_active: { type: DataTypes.ENUM("Y", "N"), allowNull: false, defaultValue: "Y" },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: "m_kategori_lembur", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });
