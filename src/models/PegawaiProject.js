const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PegawaiProject = sequelize.define("PegawaiProject", {
    id_pegawai_project: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_pegawai: { type: DataTypes.INTEGER, allowNull: false },
    id_project: { type: DataTypes.INTEGER, allowNull: false },
    is_active: { type: DataTypes.ENUM("Y", "N"), allowNull: false, defaultValue: "Y" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
    tableName: "m_pegawai_project",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
        { unique: true, name: "uk_pegawai_project", fields: ["id_pegawai", "id_project"] },
        { name: "idx_pegawai_project_project_active", fields: ["id_project", "is_active"] },
    ],
});

module.exports = PegawaiProject;
