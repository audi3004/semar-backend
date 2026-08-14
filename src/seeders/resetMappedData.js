require("dotenv").config();

const {
    sequelize,
    Role,
    Project,
    Jabatan,
    Umk,
    KoefTmk,
    Gaji,
    HariLibur,
    Unit,
    UnitRole,
    Pegawai,
    Petugas,
    User,
    Module: AppModule,
    AccessModule,
    Status,
    Mutasi,
    Lembur,
    LogLembur,
    Cuti,
    LogCuti,
    Ijin,
    LogIjin,
    Sakit,
    LogSakit,
    Sppd,
    LogSppd,
    PetugasUmkHistory,
    UmkRolloverBatch,
    ReportPermohonan,
    PegawaiProject,
} = require("../models");

const initializeSystem = require(
    "./systemInitializer"
);

const RESET_CONFIRMATION =
    "RESET-MAPPED-DATA";

function validateSafety() {
    if (
        process.env.NODE_ENV ===
        "production"
    ) {
        throw new Error(
            "Reset data ditolak pada NODE_ENV=production"
        );
    }

    if (
        process.env
            .ALLOW_DATABASE_RESET !==
        "true"
    ) {
        throw new Error(
            "Set ALLOW_DATABASE_RESET=true untuk mengizinkan reset data"
        );
    }

    if (
        process.env
            .RESET_DATABASE_CONFIRM !==
        RESET_CONFIRMATION
    ) {
        throw new Error(
            `Set RESET_DATABASE_CONFIRM=${RESET_CONFIRMATION} untuk mengonfirmasi target reset`
        );
    }

    if (!process.env.DB_NAME) {
        throw new Error(
            "DB_NAME belum dikonfigurasi"
        );
    }
}

async function clearData(
    transaction
) {
    const orderedModels = [
        PetugasUmkHistory,
        UmkRolloverBatch,
        ReportPermohonan,
        PegawaiProject,
        LogLembur,
        LogCuti,
        LogIjin,
        LogSakit,
        LogSppd,
        Lembur,
        Cuti,
        Ijin,
        Sakit,
        Sppd,
        Mutasi,
        UnitRole,
        AccessModule,
        User,
        Pegawai,
        Petugas,
        Gaji,
        HariLibur,
        KoefTmk,
        Umk,
        Jabatan,
    ];

    await Status.update(
        {
            id_status_next: null,
            id_status_revision: null,
            id_status_rejected: null,
        },
        {
            where: {},
            transaction,
        }
    );

    await Unit.update(
        { id_induk_unit: null },
        {
            where: {},
            transaction,
        }
    );

    await Umk.update(
        { id_umk_sebelumnya: null },
        { where: {}, transaction }
    );

    for (const Model of orderedModels) {
        await Model.destroy({
            where: {},
            transaction,
        });
    }

    // Sequence dokumen bukan model master, tetapi harus ikut dikosongkan agar
    // nomor transaksi kembali 001 setelah seluruh transaksi di-reset.
    await sequelize.query(
        "DELETE FROM sys_document_sequence",
        { transaction }
    );

    for (const Model of [
        Unit,
        Project,
        Status,
        AppModule,
        Role,
    ]) {
        await Model.destroy({
            where: {},
            transaction,
        });
    }
}

const resetModels = [
    PetugasUmkHistory,
    UmkRolloverBatch,
    ReportPermohonan,
    PegawaiProject,
    LogLembur,
    LogCuti,
    LogIjin,
    LogSakit,
    LogSppd,
    Lembur,
    Cuti,
    Ijin,
    Sakit,
    Sppd,
    Mutasi,
    UnitRole,
    AccessModule,
    User,
    Pegawai,
    Petugas,
    Gaji,
    HariLibur,
    KoefTmk,
    Umk,
    Jabatan,
    Unit,
    Project,
    Status,
    AppModule,
    Role,
];

async function resetAutoIncrement() {
    const queryInterface =
        sequelize.getQueryInterface();
    const queryGenerator =
        queryInterface.queryGenerator;

    for (const Model of resetModels) {
        const rawTableName =
            Model.getTableName();
        const tableName =
            typeof rawTableName === "string"
                ? rawTableName
                : rawTableName.tableName;
        const quotedTable =
            queryGenerator.quoteTable(
                tableName
            );

        await sequelize.query(
            `ALTER TABLE ${quotedTable} AUTO_INCREMENT = 1`
        );
    }

    await sequelize.query(
        "ALTER TABLE sys_document_sequence AUTO_INCREMENT = 1"
    );
}

async function resetMappedData() {
    validateSafety();
    await sequelize.authenticate();

    await sequelize.transaction(
        clearData
    );

    // MariaDB melakukan implicit commit untuk ALTER TABLE, sehingga reset
    // sequence sengaja dijalankan di antara transaksi clear dan seed.
    await resetAutoIncrement();

    return await initializeSystem();
}

async function run() {
    try {
        const summary =
            await resetMappedData();
        console.log(
            `Reset database ${process.env.DB_NAME} dan seed data mapping berhasil:`,
            summary
        );
    } catch (error) {
        console.error(
            "Reset dan seed data mapping gagal:",
            {
                name: error.name,
                message: error.message,
                table: error.table,
                fields: error.fields,
                database_message:
                    error.parent
                        ?.sqlMessage,
            }
        );
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    run();
}

module.exports = resetMappedData;
