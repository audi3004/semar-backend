const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("UmkRolloverBatch", {
    id_umk_rollover_batch: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tahun_sumber: { type: DataTypes.INTEGER, allowNull: false },
    tahun_tujuan: { type: DataTypes.INTEGER, allowNull: false },
    jumlah_petugas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM("SUCCESS", "FAILED"), allowNull: false },
    detail: { type: DataTypes.TEXT("long"), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
    tableName: "m_umk_rollover_batch",
    timestamps: false,
});
