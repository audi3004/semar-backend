"use strict";

const TRANSACTION_TABLES = ["t_lembur", "t_cuti", "t_ijin", "t_sakit", "t_sppd"];

module.exports = {
    async up(queryInterface, Sequelize) {
        const tables = await queryInterface.showAllTables();
        if (!tables.includes("m_pegawai_project")) {
            await queryInterface.createTable("m_pegawai_project", {
                id_pegawai_project: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
                id_pegawai: { type: Sequelize.INTEGER, allowNull: false, references: { model: "m_pegawai", key: "id_pegawai" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
                id_project: { type: Sequelize.INTEGER, allowNull: false, references: { model: "m_project", key: "id_project" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
                is_active: { type: Sequelize.ENUM("Y", "N"), allowNull: false, defaultValue: "Y" },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
                created_by: { type: Sequelize.INTEGER, allowNull: true },
                updated_at: { type: Sequelize.DATE, allowNull: true },
                updated_by: { type: Sequelize.INTEGER, allowNull: true },
            });
            await queryInterface.addIndex("m_pegawai_project", ["id_pegawai", "id_project"], { unique: true, name: "uk_pegawai_project" });
            await queryInterface.addIndex("m_pegawai_project", ["id_project", "is_active"], { name: "idx_pegawai_project_project_active" });
        }

        await queryInterface.sequelize.query(`
            INSERT INTO m_pegawai_project (id_pegawai, id_project, is_active, created_at)
            SELECT p.id_pegawai, j.id_project, 'Y', NOW()
            FROM m_pegawai p JOIN m_jabatan j ON j.id_jabatan = p.id_jabatan
            WHERE j.id_project IS NOT NULL
            ON DUPLICATE KEY UPDATE is_active = VALUES(is_active)
        `);

        for (const table of TRANSACTION_TABLES) {
            const columns = await queryInterface.describeTable(table);
            if (!columns.id_project) {
                await queryInterface.addColumn(table, "id_project", {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: { model: "m_project", key: "id_project" },
                    onUpdate: "CASCADE",
                    onDelete: "RESTRICT",
                });
                await queryInterface.addIndex(table, ["id_project", "id_status"], { name: `idx_${table.slice(2)}_project_status` });
            }
            await queryInterface.sequelize.query(`
                UPDATE ${table} t
                JOIN m_petugas p ON p.id_petugas = t.id_petugas
                JOIN m_jabatan j ON j.id_jabatan = p.id_jabatan
                SET t.id_project = j.id_project
                WHERE t.id_project IS NULL AND j.id_project IS NOT NULL
            `);
        }
    },

    async down(queryInterface) {
        for (const table of [...TRANSACTION_TABLES].reverse()) {
            const columns = await queryInterface.describeTable(table);
            if (columns.id_project) await queryInterface.removeColumn(table, "id_project");
        }
        const tables = await queryInterface.showAllTables();
        if (tables.includes("m_pegawai_project")) await queryInterface.dropTable("m_pegawai_project");
    },
};
