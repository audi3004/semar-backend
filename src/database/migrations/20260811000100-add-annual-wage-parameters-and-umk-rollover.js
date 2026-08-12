const { DataTypes } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            let tables = await queryInterface.showAllTables();
            if (!tables.includes("m_parameter_upah_tahunan")) await queryInterface.createTable("m_parameter_upah_tahunan", {
                id_parameter_upah: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                tahun: { type: DataTypes.INTEGER, allowNull: false, unique: true },
                nilai_rata_rata: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
                status: { type: DataTypes.ENUM("DRAFT", "PUBLISHED"), allowNull: false, defaultValue: "DRAFT" },
                created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                created_by: { type: DataTypes.INTEGER, allowNull: true },
                updated_at: { type: DataTypes.DATE, allowNull: true },
                updated_by: { type: DataTypes.INTEGER, allowNull: true },
            }, { transaction });

            const umkColumns = await queryInterface.describeTable("m_umk");
            if (!umkColumns.id_umk_sebelumnya) await queryInterface.addColumn("m_umk", "id_umk_sebelumnya", {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "m_umk", key: "id_umk" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
                after: "id_umk",
            }, { transaction });
            const umkIndexes = await queryInterface.showIndex("m_umk");
            if (!umkIndexes.some((index) => index.name === "idx_umk_sebelumnya")) await queryInterface.addIndex("m_umk", ["id_umk_sebelumnya"], {
                name: "idx_umk_sebelumnya",
                transaction,
            });

            tables = await queryInterface.showAllTables();
            if (!tables.includes("m_petugas_umk_history")) await queryInterface.createTable("m_petugas_umk_history", {
                id_petugas_umk_history: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                id_petugas: {
                    type: DataTypes.INTEGER, allowNull: false,
                    references: { model: "m_petugas", key: "id_petugas" },
                    onUpdate: "CASCADE", onDelete: "RESTRICT",
                },
                id_umk: {
                    type: DataTypes.INTEGER, allowNull: false,
                    references: { model: "m_umk", key: "id_umk" },
                    onUpdate: "CASCADE", onDelete: "RESTRICT",
                },
                berlaku_mulai: { type: DataTypes.DATEONLY, allowNull: false },
                berlaku_sampai: { type: DataTypes.DATEONLY, allowNull: true },
                created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                created_by: { type: DataTypes.INTEGER, allowNull: true },
                updated_at: { type: DataTypes.DATE, allowNull: true },
                updated_by: { type: DataTypes.INTEGER, allowNull: true },
            }, { transaction });
            let historyIndexes = await queryInterface.showIndex("m_petugas_umk_history");
            if (!historyIndexes.some((index) => index.name === "uk_petugas_umk_history_start")) await queryInterface.addIndex("m_petugas_umk_history", ["id_petugas", "berlaku_mulai"], {
                unique: true, name: "uk_petugas_umk_history_start", transaction,
            });
            historyIndexes = await queryInterface.showIndex("m_petugas_umk_history");
            if (!historyIndexes.some((index) => index.name === "idx_petugas_umk_history_period")) await queryInterface.addIndex("m_petugas_umk_history", ["id_petugas", "berlaku_sampai"], {
                name: "idx_petugas_umk_history_period", transaction,
            });

            tables = await queryInterface.showAllTables();
            if (!tables.includes("m_umk_rollover_batch")) await queryInterface.createTable("m_umk_rollover_batch", {
                id_umk_rollover_batch: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                tahun_sumber: { type: DataTypes.INTEGER, allowNull: false },
                tahun_tujuan: { type: DataTypes.INTEGER, allowNull: false },
                jumlah_petugas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                status: { type: DataTypes.ENUM("SUCCESS", "FAILED"), allowNull: false },
                detail: { type: DataTypes.TEXT("long"), allowNull: true },
                created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                created_by: { type: DataTypes.INTEGER, allowNull: true },
            }, { transaction });

            await queryInterface.sequelize.query(`
                INSERT INTO m_parameter_upah_tahunan
                    (tahun, nilai_rata_rata, status, created_at, updated_at)
                SELECT 2025, 3315728, 'PUBLISHED', NOW(), NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM m_parameter_upah_tahunan WHERE tahun = 2025
                )
            `, { transaction });
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable("m_umk_rollover_batch", { transaction });
            await queryInterface.dropTable("m_petugas_umk_history", { transaction });
            await queryInterface.removeIndex("m_umk", "idx_umk_sebelumnya", { transaction });
            await queryInterface.removeColumn("m_umk", "id_umk_sebelumnya", { transaction });
            await queryInterface.dropTable("m_parameter_upah_tahunan", { transaction });
        });
    },
};
