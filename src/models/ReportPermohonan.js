const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReportPermohonan = sequelize.define("ReportPermohonan", {
    id_report_permohonan: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    nomor_dokumen: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    nomor_urut: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    tahun_nomor: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
    tahun_periode: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
    bulan_periode: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
    id_unit_gi: { type: DataTypes.INTEGER, allowNull: false },
    id_checker: { type: DataTypes.INTEGER, allowNull: false },
    id_approval_1: { type: DataTypes.INTEGER, allowNull: false },
    checker_signature: { type: DataTypes.TEXT("long"), allowNull: true },
    checker_name: { type: DataTypes.STRING(255), allowNull: true },
    checker_nip: { type: DataTypes.STRING(100), allowNull: true },
    checker_signed_at: { type: DataTypes.DATE, allowNull: true },
    approval_1_signature: { type: DataTypes.TEXT("long"), allowNull: true },
    approval_1_name: { type: DataTypes.STRING(255), allowNull: true },
    approval_1_nip: { type: DataTypes.STRING(100), allowNull: true },
    approval_1_signed_at: { type: DataTypes.DATE, allowNull: true },
    snapshot_json: { type: DataTypes.TEXT("long"), allowNull: false },
    transaction_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
    tableName: "t_report_permohonan",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
        { unique: true, name: "uk_report_permohonan_unit_period", fields: ["id_unit_gi", "tahun_periode", "bulan_periode"] },
        { unique: true, name: "uk_report_permohonan_year_sequence", fields: ["tahun_nomor", "nomor_urut"] },
        { name: "idx_report_permohonan_signers", fields: ["id_checker", "id_approval_1"] },
    ],
});

module.exports = ReportPermohonan;
