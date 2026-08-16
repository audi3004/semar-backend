"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("m_petugas", "id_project", {
            type: Sequelize.INTEGER, allowNull: true,
            references: { model: "m_project", key: "id_project" }, onUpdate: "CASCADE", onDelete: "RESTRICT",
            after: "id_unit",
        });
        await queryInterface.sequelize.query(`UPDATE m_petugas p JOIN m_jabatan j ON j.id_jabatan = p.id_jabatan SET p.id_project = j.id_project WHERE p.id_project IS NULL`);
        await queryInterface.sequelize.query(`UPDATE m_petugas SET id_project = (SELECT id_project FROM m_project WHERE nama_project = 'OPGI' LIMIT 1) WHERE id_project IS NULL`);
        await queryInterface.changeColumn("m_petugas", "id_project", { type: Sequelize.INTEGER, allowNull: false, references: { model: "m_project", key: "id_project" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
        await queryInterface.addIndex("m_petugas", ["id_project"], { name: "idx_petugas_project" });
        await queryInterface.removeColumn("m_jabatan", "id_project");
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn("m_jabatan", "id_project", { type: Sequelize.INTEGER, allowNull: true, references: { model: "m_project", key: "id_project" }, onUpdate: "CASCADE", onDelete: "RESTRICT", after: "id_jabatan" });
        await queryInterface.sequelize.query(`UPDATE m_jabatan SET id_project = (SELECT id_project FROM m_project WHERE nama_project = 'OPGI' LIMIT 1) WHERE id_project IS NULL`);
        await queryInterface.changeColumn("m_jabatan", "id_project", { type: Sequelize.INTEGER, allowNull: false, references: { model: "m_project", key: "id_project" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
        await queryInterface.removeColumn("m_petugas", "id_project");
    },
};
