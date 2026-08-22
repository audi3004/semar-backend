const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("JenisPekerjaanLembur", {
    id_jenis_pekerjaan_lembur: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_kategori_lembur: { type: DataTypes.INTEGER, allowNull: false, references: { model: "m_kategori_lembur", key: "id_kategori_lembur" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
    kode_jenis: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    nama_jenis: { type: DataTypes.STRING(150), allowNull: false },
    kode_perilaku: { type: DataTypes.ENUM("REGULAR", "SIAGA_HARI_LIBUR", "PENGGANTI_KETIDAKHADIRAN"), allowNull: false, defaultValue: "REGULAR" },
    requires_replacement_officer: { type: DataTypes.ENUM("Y", "N"), allowNull: false, defaultValue: "N" },
    evidence_optional: { type: DataTypes.ENUM("Y", "N"), allowNull: false, defaultValue: "N" },
    max_daily_hours: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
    urutan: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_active: { type: DataTypes.ENUM("Y", "N"), allowNull: false, defaultValue: "Y" },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: "m_jenis_pekerjaan_lembur", timestamps: true, createdAt: "created_at", updatedAt: "updated_at", indexes: [{ unique: true, fields: ["id_kategori_lembur", "nama_jenis"] }] });
