"use strict";

const { DataTypes, QueryTypes } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const definition = await queryInterface.describeTable("t_report_permohonan");
        if (!definition.id_project) {
            await queryInterface.addColumn("t_report_permohonan", "id_project", {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "m_project", key: "id_project" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            });
            const projects = await queryInterface.sequelize.query(
                "SELECT id_project FROM m_project ORDER BY id_project ASC LIMIT 1",
                { type: QueryTypes.SELECT }
            );
            if (!projects[0]) throw new Error("Project wajib tersedia sebelum migrasi report permohonan");
            await queryInterface.sequelize.query(
                "UPDATE t_report_permohonan SET id_project = :idProject WHERE id_project IS NULL",
                { replacements: { idProject: projects[0].id_project } }
            );
            await queryInterface.changeColumn("t_report_permohonan", "id_project", {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "m_project", key: "id_project" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            });
        }
        await queryInterface.removeIndex("t_report_permohonan", "uk_report_permohonan_unit_period").catch(() => {});
        await queryInterface.addIndex(
            "t_report_permohonan",
            ["id_project", "id_unit_gi", "tahun_periode", "bulan_periode"],
            { unique: true, name: "uk_report_permohonan_project_unit_period" }
        ).catch(() => {});
    },

    async down(queryInterface) {
        await queryInterface.removeIndex("t_report_permohonan", "uk_report_permohonan_project_unit_period").catch(() => {});
        await queryInterface.addIndex(
            "t_report_permohonan",
            ["id_unit_gi", "tahun_periode", "bulan_periode"],
            { unique: true, name: "uk_report_permohonan_unit_period" }
        );
        await queryInterface.removeColumn("t_report_permohonan", "id_project");
    },
};
