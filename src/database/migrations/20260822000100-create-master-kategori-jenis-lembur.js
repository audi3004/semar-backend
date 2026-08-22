"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const existingTables = (await queryInterface.showAllTables()).map((table) =>
            String(typeof table === "string" ? table : table.tableName || table.name)
                .toLowerCase()
        );

        if (!existingTables.includes("m_kategori_lembur")) await queryInterface.createTable("m_kategori_lembur", {
            id_kategori_lembur: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            kode_kategori: { type: Sequelize.STRING(50), allowNull: false, unique: true },
            nama_kategori: { type: Sequelize.STRING(150), allowNull: false },
            jenis_mode: { type: Sequelize.ENUM("NONE", "OPTIONAL", "REQUIRED"), allowNull: false, defaultValue: "REQUIRED" },
            urutan: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            is_active: { type: Sequelize.ENUM("Y", "N"), allowNull: false, defaultValue: "Y" },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
            created_by: { type: Sequelize.INTEGER, allowNull: true }, updated_at: { type: Sequelize.DATE, allowNull: true }, updated_by: { type: Sequelize.INTEGER, allowNull: true },
        });
        if (!existingTables.includes("m_jenis_pekerjaan_lembur")) await queryInterface.createTable("m_jenis_pekerjaan_lembur", {
            id_jenis_pekerjaan_lembur: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            id_kategori_lembur: { type: Sequelize.INTEGER, allowNull: false, references: { model: "m_kategori_lembur", key: "id_kategori_lembur" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
            kode_jenis: { type: Sequelize.STRING(50), allowNull: false, unique: true }, nama_jenis: { type: Sequelize.STRING(150), allowNull: false },
            kode_perilaku: { type: Sequelize.ENUM("REGULAR", "SIAGA_HARI_LIBUR", "PENGGANTI_KETIDAKHADIRAN"), allowNull: false, defaultValue: "REGULAR" },
            requires_replacement_officer: { type: Sequelize.ENUM("Y", "N"), allowNull: false, defaultValue: "N" }, evidence_optional: { type: Sequelize.ENUM("Y", "N"), allowNull: false, defaultValue: "N" },
            max_daily_hours: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 4 }, urutan: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }, is_active: { type: Sequelize.ENUM("Y", "N"), allowNull: false, defaultValue: "Y" },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") }, created_by: { type: Sequelize.INTEGER, allowNull: true }, updated_at: { type: Sequelize.DATE, allowNull: true }, updated_by: { type: Sequelize.INTEGER, allowNull: true },
        });
        const jenisIndexes = await queryInterface.showIndex("m_jenis_pekerjaan_lembur");
        if (!jenisIndexes.some((index) => index.name === "uk_jenis_lembur_kategori_nama")) {
            await queryInterface.addConstraint("m_jenis_pekerjaan_lembur", { fields: ["id_kategori_lembur", "nama_jenis"], type: "unique", name: "uk_jenis_lembur_kategori_nama" });
        }
        for (const table of ["t_spkl", "t_lembur"]) {
            const columns = await queryInterface.describeTable(table);
            if (!columns.id_kategori_lembur) {
                await queryInterface.addColumn(table, "id_kategori_lembur", { type: Sequelize.INTEGER, allowNull: true, references: { model: "m_kategori_lembur", key: "id_kategori_lembur" }, onUpdate: "CASCADE", onDelete: "SET NULL" });
            }
            if (!columns.id_jenis_pekerjaan_lembur) {
                await queryInterface.addColumn(table, "id_jenis_pekerjaan_lembur", { type: Sequelize.INTEGER, allowNull: true, references: { model: "m_jenis_pekerjaan_lembur", key: "id_jenis_pekerjaan_lembur" }, onUpdate: "CASCADE", onDelete: "SET NULL" });
            }
        }
        await queryInterface.changeColumn("t_spkl", "jenis_pekerjaan", { type: Sequelize.STRING(1000), allowNull: true });
        const now = new Date();
        await queryInterface.bulkInsert("m_kategori_lembur", [
            { kode_kategori: "TOWER", nama_kategori: "Pekerjaan Tower", jenis_mode: "REQUIRED", urutan: 10, is_active: "Y", created_at: now },
            { kode_kategori: "VALIDASI_ROW", nama_kategori: "Perbantuan Validasi ROW", jenis_mode: "NONE", urutan: 20, is_active: "Y", created_at: now },
            { kode_kategori: "EMERGENCY", nama_kategori: "Emergency / Pelacakan Gangguan", jenis_mode: "NONE", urutan: 30, is_active: "Y", created_at: now },
            { kode_kategori: "MANUVER", nama_kategori: "Manuver", jenis_mode: "REQUIRED", urutan: 40, is_active: "Y", created_at: now },
            { kode_kategori: "SIAGA_HARI_LIBUR", nama_kategori: "Siaga Hari Libur", jenis_mode: "REQUIRED", urutan: 50, is_active: "Y", created_at: now },
            { kode_kategori: "PENGGANTI_KETIDAKHADIRAN", nama_kategori: "005 - Piket Tanggal Merah / Cuti Pengganti", jenis_mode: "REQUIRED", urutan: 60, is_active: "Y", created_at: now },
        ], { ignoreDuplicates: true });
        const [categories] = await queryInterface.sequelize.query("SELECT id_kategori_lembur, kode_kategori FROM m_kategori_lembur");
        const categoryId = Object.fromEntries(categories.map((row) => [row.kode_kategori, row.id_kategori_lembur]));
        await queryInterface.bulkInsert("m_jenis_pekerjaan_lembur", [
            ["TOWER_PENTANAHAN", "Perbaikan Anomali Pentanahan", "TOWER", "REGULAR", 10], ["TOWER_ASSESSMENT", "Assesment Kondisi Tower", "TOWER", "REGULAR", 20], ["TOWER_PENGUKURAN", "Pengukuran Pentanahan", "TOWER", "REGULAR", 30],
            ["MANUVER_KONFIGURASI", "Manuver Konfigurasi", "MANUVER", "REGULAR", 10], ["MANUVER_PEMELIHARAAN", "Manuver Pemeliharaan", "MANUVER", "REGULAR", 20], ["MANUVER_EMERGENCY", "Manuver Emergency", "MANUVER", "REGULAR", 30],
            ["SIAGA_LIBUR", "Siaga / Libur Nasional", "SIAGA_HARI_LIBUR", "SIAGA_HARI_LIBUR", 10], ["PENGGANTI_CUTI", "Pengganti CUTI", "PENGGANTI_KETIDAKHADIRAN", "PENGGANTI_KETIDAKHADIRAN", 10], ["PENGGANTI_IJIN", "Pengganti IJIN", "PENGGANTI_KETIDAKHADIRAN", "PENGGANTI_KETIDAKHADIRAN", 20], ["PENGGANTI_SAKIT", "Pengganti SAKIT", "PENGGANTI_KETIDAKHADIRAN", "PENGGANTI_KETIDAKHADIRAN", 30],
        ].map(([kode_jenis, nama_jenis, category, kode_perilaku, urutan]) => ({ id_kategori_lembur: categoryId[category], kode_jenis, nama_jenis, kode_perilaku, requires_replacement_officer: kode_perilaku === "PENGGANTI_KETIDAKHADIRAN" ? "Y" : "N", evidence_optional: kode_perilaku === "REGULAR" ? "N" : "Y", max_daily_hours: kode_perilaku === "REGULAR" ? 4 : 8, urutan, is_active: "Y", created_at: now })), { ignoreDuplicates: true });
        const compatibleCollation = "utf8mb4_unicode_ci";
        await queryInterface.sequelize.query(`UPDATE t_spkl s JOIN m_kategori_lembur k ON CONVERT(k.nama_kategori USING utf8mb4) COLLATE ${compatibleCollation} = CONVERT(s.kategori_lembur USING utf8mb4) COLLATE ${compatibleCollation} SET s.id_kategori_lembur = k.id_kategori_lembur`);
        await queryInterface.sequelize.query(`UPDATE t_spkl s JOIN m_jenis_pekerjaan_lembur j ON CONVERT(j.nama_jenis USING utf8mb4) COLLATE ${compatibleCollation} = CONVERT(s.jenis_pekerjaan USING utf8mb4) COLLATE ${compatibleCollation} AND j.id_kategori_lembur = s.id_kategori_lembur SET s.id_jenis_pekerjaan_lembur = j.id_jenis_pekerjaan_lembur`);
        await queryInterface.sequelize.query(`UPDATE t_lembur l JOIN m_kategori_lembur k ON CONVERT(k.nama_kategori USING utf8mb4) COLLATE ${compatibleCollation} = CONVERT(l.kategori_lembur USING utf8mb4) COLLATE ${compatibleCollation} SET l.id_kategori_lembur = k.id_kategori_lembur`);
        await queryInterface.sequelize.query(`UPDATE t_lembur l JOIN m_jenis_pekerjaan_lembur j ON CONVERT(j.nama_jenis USING utf8mb4) COLLATE ${compatibleCollation} = CONVERT(l.jenis_pekerjaan USING utf8mb4) COLLATE ${compatibleCollation} AND j.id_kategori_lembur = l.id_kategori_lembur SET l.id_jenis_pekerjaan_lembur = j.id_jenis_pekerjaan_lembur`);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn("t_spkl", "jenis_pekerjaan", { type: Sequelize.STRING(1000), allowNull: false });
        for (const table of ["t_lembur", "t_spkl"]) { await queryInterface.removeColumn(table, "id_jenis_pekerjaan_lembur"); await queryInterface.removeColumn(table, "id_kategori_lembur"); }
        await queryInterface.dropTable("m_jenis_pekerjaan_lembur"); await queryInterface.dropTable("m_kategori_lembur");
    },
};
