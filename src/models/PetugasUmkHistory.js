const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("PetugasUmkHistory", {
    id_petugas_umk_history: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_petugas: { type: DataTypes.INTEGER, allowNull: false },
    id_umk: { type: DataTypes.INTEGER, allowNull: false },
    berlaku_mulai: { type: DataTypes.DATEONLY, allowNull: false },
    berlaku_sampai: { type: DataTypes.DATEONLY, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
    tableName: "m_petugas_umk_history",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
