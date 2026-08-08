require("dotenv").config();

const { Op } = require("sequelize");
const {
    sequelize,
    Role,
    Module: AppModule,
    AccessModule,
} = require("../models");

const modules = [
    ["dashboard", "Dashboard", "Dashboard aplikasi"],
    ["lembur", "Lembur", "Pengajuan lembur"],
    ["cuti", "Cuti", "Pengajuan cuti"],
    ["ijin", "Ijin", "Pengajuan izin"],
    ["sakit", "Sakit", "Pengajuan sakit"],
    ["sppd", "SPPD", "Perjalanan dinas"],
    ["workflow", "Workflow", "Workflow persetujuan"],
    ["list-dokumen", "List Dokumen", "Daftar dokumen pengajuan"],
    ["report-permohonan", "Report Permohonan", "Laporan permohonan"],
    ["unit-kerja", "Unit Kerja", "Master unit kerja"],
    ["project", "Project", "Master project"],
    ["jabatan", "Jabatan", "Master jabatan"],
    ["pegawai", "Pegawai", "Master pegawai"],
    ["umk", "UMK", "Master UMK"],
    ["faktor-upah", "Faktor Upah", "Pengaturan faktor upah"],
    ["hari-libur", "Hari Libur", "Master hari libur"],
    ["mutasi-pegawai", "Mutasi Pegawai", "Transaksi mutasi pegawai"],
    ["users", "Users", "Master pengguna"],
    ["roles", "Roles", "Master role"],
    ["responsibilities", "Responsibilities", "Pengaturan tanggung jawab dan akses"],
    ["pengaturan", "Pengaturan", "Pengaturan aplikasi"],
];

async function run() {
    try {
        const result = await sequelize.transaction(
            async (transaction) => {
                const superAdminRole = await Role.findOne({
                    where: {
                        kode_role: "SUPER_ADMIN",
                    },
                    transaction,
                });

                if (!superAdminRole) {
                    throw new Error(
                        "Role SUPER_ADMIN belum tersedia. Jalankan seed:super-admin terlebih dahulu."
                    );
                }

                const moduleIds = [];

                for (const [
                    kode_module,
                    nama_module,
                    deskripsi,
                ] of modules) {
                    const [appModule] =
                        await AppModule.findOrCreate({
                            where: { kode_module },
                            defaults: {
                                nama_module,
                                deskripsi,
                                is_active: "Y",
                            },
                            transaction,
                        });

                    await appModule.update(
                        {
                            nama_module,
                            deskripsi,
                            is_active: "Y",
                            updated_at: new Date(),
                        },
                        { transaction }
                    );

                    moduleIds.push(appModule.id_module);

                    const [access] =
                        await AccessModule.findOrCreate({
                            where: {
                                id_role: superAdminRole.id_role,
                                id_module: appModule.id_module,
                            },
                            defaults: {
                                can_create: "Y",
                                can_read: "Y",
                                can_update: "Y",
                                can_delete: "Y",
                                can_approve: "Y",
                            },
                            transaction,
                        });

                    await access.update(
                        {
                            can_create: "Y",
                            can_read: "Y",
                            can_update: "Y",
                            can_delete: "Y",
                            can_approve: "Y",
                            updated_at: new Date(),
                        },
                        { transaction }
                    );
                }

                await AppModule.update(
                    {
                        is_active: "N",
                        updated_at: new Date(),
                    },
                    {
                        where: {
                            id_module: {
                                [Op.notIn]: moduleIds,
                            },
                        },
                        transaction,
                    }
                );

                return {
                    modules: moduleIds.length,
                    role: superAdminRole.kode_role,
                };
            }
        );

        console.log(
            `${result.modules} module berhasil disinkronkan untuk ${result.role}.`
        );
    } catch (error) {
        console.error(
            "Gagal melakukan seed module/access:",
            error.message
        );
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    run();
}

module.exports = run;
