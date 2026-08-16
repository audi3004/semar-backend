const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Spkl = sequelize.define("Spkl", {
    id_spkl: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_dokumen: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    id_unit: { type: DataTypes.INTEGER, allowNull: false, references: { model: "m_unit", key: "id_unit" } },
    tgl_lembur: { type: DataTypes.DATEONLY, allowNull: false },
    kategori_lembur: { type: DataTypes.STRING(1000), allowNull: false },
    jenis_pekerjaan: { type: DataTypes.STRING(1000), allowNull: false },
    kode_jenis_pekerjaan: { type: DataTypes.ENUM("REGULAR", "SIAGA_HARI_LIBUR"), allowNull: false, defaultValue: "REGULAR" },
    area_group: { type: DataTypes.STRING(255), allowNull: true },
    detail_pekerjaan: { type: DataTypes.TEXT, allowNull: true },
    status_spkl: { type: DataTypes.ENUM("DRAFT", "ACTIVE", "CANCELLED", "COMPLETED"), allowNull: false, defaultValue: "ACTIVE" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: "t_spkl", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

module.exports = Spkl;
