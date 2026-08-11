const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("ParameterUpahTahunan", {
    id_parameter_upah: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tahun: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    nilai_rata_rata: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    status: { type: DataTypes.ENUM("DRAFT", "PUBLISHED"), allowNull: false, defaultValue: "DRAFT" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
    tableName: "m_parameter_upah_tahunan",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
