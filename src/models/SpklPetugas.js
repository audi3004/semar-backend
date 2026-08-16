const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SpklPetugas = sequelize.define("SpklPetugas", {
    id_spkl_petugas: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_spkl: { type: DataTypes.INTEGER, allowNull: false, references: { model: "t_spkl", key: "id_spkl" } },
    id_petugas: { type: DataTypes.INTEGER, allowNull: false, references: { model: "m_petugas", key: "id_petugas" } },
    status_penugasan: { type: DataTypes.ENUM("ASSIGNED", "DRAFTED", "SUBMITTED", "CANCELLED"), allowNull: false, defaultValue: "ASSIGNED" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: "t_spkl_petugas", timestamps: true, createdAt: "created_at", updatedAt: "updated_at", indexes: [{ unique: true, fields: ["id_spkl", "id_petugas"] }] });

module.exports = SpklPetugas;
