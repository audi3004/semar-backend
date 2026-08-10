require("dotenv").config();

const bcrypt = require("bcrypt");
const {
    Op,
} = require("sequelize");

const {
    sequelize,
    Role,
    Project,
    Jabatan,
    Umk,
    KoefTmk,
    HariLibur,
    Unit,
    Pegawai,
    Petugas,
    User,
    Module: AppModule,
    AccessModule,
    Status,
    UnitRole,
} = require("../models");

const data = require(
    "./data/initialMasterData.json"
);

const SUPER_ADMIN_USERNAME =
    process.env
        .SUPER_ADMIN_USERNAME ||
    "superadmin";
const SUPER_ADMIN_PASSWORD =
    process.env
        .SUPER_ADMIN_PASSWORD ||
    "SuperAdmin123!!";
const ADMIN_USERNAME =
    String(
        process.env.ADMIN_USERNAME ||
        "administrator"
    ).trim().length >= 8
        ? String(
            process.env.ADMIN_USERNAME ||
            "administrator"
        ).trim()
        : "administrator";
const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD ||
    "Admin123!!";
const DEFAULT_PEGAWAI_JOIN_DATE =
    "2026-08-01";

// Koreksi mapping legacy: jabatan 5 (Assistant Manager) pada data pegawai
// seharusnya menggunakan jabatan 6 (Team Leader).
const mapSeedJabatanId = (idJabatan) =>
    Number(idJabatan) === 5 ? 6 : idJabatan;

const statuses = [
    {
        code: "DRAFT",
        name: "Draft",
        order: 10,
        role: "MAKER",
        next: "WAITING_CHECKER",
        revision: null,
        rejected: "REJECTED",
        initial: "Y",
        final: "N",
    },
    {
        code: "WAITING_CHECKER",
        name: "Menunggu Checker",
        order: 20,
        role: "CHECKER",
        next: "WAITING_VERIFICATION",
        revision: "REVISION",
        rejected: "REJECTED",
        initial: "N",
        final: "N",
    },
    {
        code: "WAITING_VERIFICATION",
        name: "Menunggu Verification",
        order: 30,
        role: "VERIFICATION",
        next: "WAITING_APPROVAL_1",
        revision: "REVISION",
        rejected: "REJECTED",
        initial: "N",
        final: "N",
    },
    {
        code: "WAITING_APPROVAL_1",
        name: "Menunggu Approval 1",
        order: 40,
        role: "APPROVAL_1",
        next: "WAITING_APPROVAL_2",
        revision: "REVISION",
        rejected: "REJECTED",
        initial: "N",
        final: "N",
    },
    {
        code: "WAITING_APPROVAL_2",
        name: "Menunggu Approval 2",
        order: 50,
        role: "APPROVAL_2",
        next: "WAITING_APPROVAL_3",
        revision: "REVISION",
        rejected: "REJECTED",
        initial: "N",
        final: "N",
    },
    {
        code: "WAITING_APPROVAL_3",
        name: "Menunggu Approval 3",
        order: 60,
        role: "APPROVAL_3",
        next: "APPROVED",
        revision: "REVISION",
        rejected: "REJECTED",
        initial: "N",
        final: "N",
    },
    {
        code: "REVISION",
        name: "Revision",
        order: 70,
        role: "MAKER",
        next: "WAITING_CHECKER",
        revision: null,
        rejected: "REJECTED",
        initial: "N",
        final: "N",
    },
    {
        code: "APPROVED",
        name: "Approved",
        order: 80,
        role: null,
        next: null,
        revision: null,
        rejected: null,
        initial: "N",
        final: "Y",
    },
    {
        code: "REJECTED",
        name: "Rejected",
        order: 90,
        role: null,
        next: null,
        revision: null,
        rejected: null,
        initial: "N",
        final: "Y",
    },
];

async function upsertOne(
    Model,
    where,
    values,
    transaction
) {
    const existing =
        await Model.findOne({
            where,
            transaction,
        });

    if (existing) {
        await existing.update(
            values,
            { transaction }
        );
        return existing;
    }

    return await Model.create(
        { ...where, ...values },
        { transaction }
    );
}

function requireMapped(
    map,
    excelId,
    label
) {
    const value = map[excelId];
    if (!value) {
        throw new Error(
            `${label} ID Excel ${excelId} tidak ditemukan pada dataset`
        );
    }
    return value;
}

function generatedPegawaiNip(
    excelId
) {
    return `PEG-${String(excelId)
        .padStart(6, "0")}`;
}

function fullPermission() {
    return {
        can_create: "Y",
        can_read: "Y",
        can_update: "Y",
        can_delete: "Y",
        can_approve: "Y",
    };
}

function normalizeModuleCode(code) {
    if (code === "responsibilites") {
        return "responsibilities";
    }
    return code;
}

function normalizeSeedUsername(
    row,
    person,
    duplicateNames
) {
    const current = String(
        row.username ?? ""
    ).trim();

    if (current.length >= 8) {
        return current;
    }

    const base = String(
        person?.nama ?? current
    )
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const suffix = String(
        row.id_user
    ).padStart(3, "0");
    const needsSuffix =
        base.length < 8 ||
        duplicateNames.has(base);
    const username = needsSuffix
        ? `${base}${suffix}`
        : base;

    return username.padEnd(8, "0");
}

async function seedSystem(
    transaction
) {
            const now = new Date();
            const roleMap = {};
            const projectMap = {};
            const jabatanMap = {};
            const unitMap = {};
            const umkMap = {};
            const koefTmkMap = {};
            const pegawaiMap = {};
            const petugasMap = {};
            const userMap = {};
            const moduleMap = {};
            const accessKeys =
                new Set();
            const pegawaiDataMap =
                new Map(
                    data.m_pegawai.map(
                        (row) => [
                            row.id_pegawai,
                            row,
                        ]
                    )
                );
            const usernameBaseCounts =
                new Map();

            for (const row of data.m_user) {
                if (String(row.username ?? "").trim().length >= 8) continue;
                const person = pegawaiDataMap.get(row.id_pegawai);
                const base = String(person?.nama ?? row.username ?? "")
                    .normalize("NFKD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "");
                usernameBaseCounts.set(
                    base,
                    (usernameBaseCounts.get(base) || 0) + 1
                );
            }

            const duplicateUsernameBases =
                new Set(
                    [...usernameBaseCounts]
                        .filter(([, count]) => count > 1)
                        .map(([base]) => base)
                );

            for (const row of data.m_role) {
                const role = await upsertOne(
                    Role,
                    {
                        kode_role:
                            row.kode_role,
                    },
                    {
                        nama_role:
                            row.nama_role,
                        level_role:
                            row.level_role,
                        is_super_admin:
                            row.is_super_admin,
                        is_active: "Y",
                        updated_at: now,
                    },
                    transaction
                );
                roleMap[row.id_role] = role;
                roleMap[row.kode_role] = role;
            }

            for (const row of data.m_project) {
                projectMap[row.id_project] =
                    await upsertOne(
                        Project,
                        {
                            nama_project:
                                row.nama_project,
                        },
                        {
                            is_active: "Y",
                            updated_at: now,
                        },
                        transaction
                    );
            }

            for (const row of data.m_jabatan) {
                const project =
                    requireMapped(
                        projectMap,
                        row.id_project,
                        "Project"
                    );
                jabatanMap[row.id_jabatan] =
                    await upsertOne(
                        Jabatan,
                        {
                            id_project:
                                project.id_project,
                            nama_jabatan:
                                row.nama_jabatan,
                        },
                        {
                            is_active: "Y",
                            updated_at: now,
                        },
                        transaction
                    );
            }

            for (const row of data.m_unit) {
                const parent =
                    row.id_induk_unit ===
                        null
                        ? null
                        : requireMapped(
                            unitMap,
                            row.id_induk_unit,
                            "Unit induk"
                        );
                unitMap[row.id_unit] =
                    await upsertOne(
                        Unit,
                        {
                            nama_unit:
                                row.nama_unit,
                        },
                        {
                            id_induk_unit:
                                parent
                                    ?.id_unit ??
                                null,
                            is_active: "Y",
                            updated_at: now,
                        },
                        transaction
                    );
            }

            for (const row of data.m_umk) {
                umkMap[row.id_umk] =
                    await upsertOne(
                        Umk,
                        {
                            jenis_wilayah:
                                row.jenis_wilayah,
                            nama_wilayah:
                                row.nama_wilayah,
                            tahun_umk:
                                row.tahun_umk,
                        },
                        {
                            nominal_umk:
                                row.nominal_umk,
                            is_active: "Y",
                            updated_at: now,
                        },
                        transaction
                    );
            }

            for (const row of data.m_koef_tmk) {
                koefTmkMap[
                    row.id_koef_tmk
                ] = await upsertOne(
                    KoefTmk,
                    {
                        masa_kerja:
                            String(
                                row.masa_kerja
                            ),
                    },
                    {
                        keterangan:
                            row.keterangan,
                        koef: row.koef,
                        tmk: row.tmk,
                        is_active: "Y",
                        updated_at: now,
                    },
                    transaction
                );
            }

            for (const row of data.m_hari_libur) {
                await upsertOne(
                    HariLibur,
                    { tanggal: row.tanggal },
                    {
                        nama_hari_libur: row.nama_hari_libur,
                        keterangan: row.keterangan,
                        is_active: "Y",
                        updated_at: now,
                    },
                    transaction
                );
            }

            for (const row of data.m_pegawai) {
                const nip = row.nip
                    ? String(row.nip)
                    : generatedPegawaiNip(
                        row.id_pegawai
                    );
                const jabatan =
                    requireMapped(
                        jabatanMap,
                        mapSeedJabatanId(row.id_jabatan),
                        "Jabatan pegawai"
                    );
                const unit = requireMapped(
                    unitMap,
                    row.id_unit,
                    "Unit pegawai"
                );

                pegawaiMap[row.id_pegawai] =
                    await upsertOne(
                        Pegawai,
                        { nip },
                        {
                            id_jabatan:
                                jabatan.id_jabatan,
                            id_unit:
                                unit.id_unit,
                            nama: row.nama,
                            tgl_masuk:
                                DEFAULT_PEGAWAI_JOIN_DATE,
                            tgl_lahir: null,
                            is_active: "Y",
                            updated_at: now,
                        },
                        transaction
                    );
            }

            for (const row of data.m_petugas) {
                const unit = requireMapped(
                    unitMap,
                    row.id_unit,
                    "Unit petugas"
                );
                const umk = requireMapped(
                    umkMap,
                    row.id_umk,
                    "UMK petugas"
                );
                const jabatan =
                    row.id_jabatan === null
                        ? null
                        : requireMapped(
                            jabatanMap,
                            mapSeedJabatanId(row.id_jabatan),
                            "Jabatan petugas"
                        );

                petugasMap[row.id_petugas] =
                    await upsertOne(
                        Petugas,
                        {
                            nip: String(
                                row.nip
                            ),
                        },
                        {
                            id_unit:
                                unit.id_unit,
                            id_jabatan:
                                jabatan
                                    ?.id_jabatan ??
                                null,
                            id_umk:
                                umk.id_umk,
                            nama: row.nama,
                            tgl_masuk:
                                row.tgl_masuk,
                            tgl_lahir:
                                row.tgl_lahir ??
                                null,
                            is_active: "Y",
                            updated_at: now,
                        },
                        transaction
                    );
            }

            for (const row of data.m_user) {
                const pegawai =
                    row.id_pegawai === null
                        ? null
                        : requireMapped(
                            pegawaiMap,
                            row.id_pegawai,
                            "Pegawai user"
                        );
                const petugas =
                    row.id_petugas === null
                        ? null
                        : requireMapped(
                            petugasMap,
                            row.id_petugas,
                            "Petugas user"
                        );
                const role = requireMapped(
                    roleMap,
                    row.id_role,
                    "Role user"
                );
                const username =
                    normalizeSeedUsername(
                        row,
                        pegawaiDataMap.get(
                            row.id_pegawai
                        ),
                        duplicateUsernameBases
                    );

                userMap[row.id_user] =
                    await upsertOne(
                        User,
                        {
                            ...(row.id_pegawai !== null
                                ? {
                                    id_pegawai:
                                        pegawai.id_pegawai,
                                }
                                : {
                                    id_petugas:
                                        petugas.id_petugas,
                                }),
                        },
                        {
                            id_pegawai:
                                pegawai
                                    ?.id_pegawai ??
                                null,
                            id_petugas:
                                petugas
                                    ?.id_petugas ??
                                null,
                            id_role:
                                role.id_role,
                            username,
                            password:
                                row.password,
                            email:
                                row.email ?? null,
                            is_active: "Y",
                            updated_at: now,
                        },
                        transaction
                    );
            }

            const [adminPassword,
                superAdminPassword] =
                await Promise.all([
                    bcrypt.hash(
                        ADMIN_PASSWORD,
                        12
                    ),
                    bcrypt.hash(
                        SUPER_ADMIN_PASSWORD,
                        12
                    ),
                ]);

            const admin = await upsertOne(
                User,
                { username: ADMIN_USERNAME },
                {
                    id_pegawai: null,
                    id_petugas: null,
                    id_role:
                        roleMap.ADMIN
                            .id_role,
                    password:
                        adminPassword,
                    email: null,
                    is_active: "Y",
                    refresh_token_hash: null,
                    refresh_token_expires_at:
                        null,
                    updated_at: now,
                },
                transaction
            );

            const superAdmin =
                await upsertOne(
                    User,
                    {
                        username:
                            SUPER_ADMIN_USERNAME,
                    },
                    {
                        id_pegawai: null,
                        id_petugas: null,
                        id_role:
                            roleMap
                                .SUPER_ADMIN
                                .id_role,
                        password:
                            superAdminPassword,
                        email: null,
                        is_active: "Y",
                        refresh_token_hash:
                            null,
                        refresh_token_expires_at:
                            null,
                        updated_at: now,
                    },
                    transaction
                );

            for (const row of data.m_module) {
                const moduleCode =
                    normalizeModuleCode(
                        row.kode_module
                    );
                moduleMap[row.id_module] =
                    await upsertOne(
                        AppModule,
                        {
                            kode_module:
                                moduleCode,
                        },
                        {
                            nama_module:
                                row.nama_module,
                            deskripsi:
                                row.deskripsi,
                            is_active: "Y",
                            updated_at: now,
                        },
                        transaction
                    );
            }

            const seededModuleIds =
                Object.values(moduleMap)
                    .map(
                        (appModule) =>
                            appModule.id_module
                    );

            await AppModule.update(
                {
                    is_active: "N",
                    updated_at: now,
                },
                {
                    where: {
                        id_module: {
                            [Op.notIn]:
                                seededModuleIds,
                        },
                    },
                    transaction,
                }
            );

            await AccessModule.destroy({
                where: {},
                transaction,
            });

            for (
                const row of
                data.m_access_module
            ) {
                const role = requireMapped(
                    roleMap,
                    row.id_role,
                    "Role access module"
                );
                const appModule =
                    requireMapped(
                        moduleMap,
                        row.id_module,
                        "Module access"
                    );
                await upsertOne(
                    AccessModule,
                    {
                        id_role:
                            role.id_role,
                        id_module:
                            appModule.id_module,
                    },
                    {
                        can_create:
                            row.can_create,
                        can_read:
                            row.can_read,
                        can_update:
                            row.can_update,
                        can_delete:
                            row.can_delete,
                        can_approve:
                            row.can_approve,
                        updated_at: now,
                    },
                    transaction
                );
                accessKeys.add(
                    `${role.id_role}:${appModule.id_module}`
                );
            }

            for (const roleCode of [
                "ADMIN",
                "SUPER_ADMIN",
            ]) {
                for (
                    const appModule of
                    Object.values(
                        moduleMap
                    )
                ) {
                    await upsertOne(
                        AccessModule,
                        {
                            id_role:
                                roleMap[
                                    roleCode
                                ].id_role,
                            id_module:
                                appModule
                                    .id_module,
                        },
                        {
                            ...fullPermission(),
                            updated_at: now,
                        },
                        transaction
                    );
                    accessKeys.add(
                        `${roleMap[roleCode].id_role}:${appModule.id_module}`
                    );
                }
            }

            for (const row of data.m_unit_role) {
                const user = requireMapped(
                    userMap,
                    row.id_user,
                    "User unit role"
                );
                const unit = requireMapped(
                    unitMap,
                    row.id_unit,
                    "Unit role"
                );
                const role = requireMapped(
                    roleMap,
                    row.id_role,
                    "Role unit"
                );
                await upsertOne(
                    UnitRole,
                    {
                        id_user:
                            user.id_user,
                        id_unit:
                            unit.id_unit,
                        id_role:
                            role.id_role,
                    },
                    { is_active: "Y" },
                    transaction
                );
            }

            const statusMap = {};
            for (const status of statuses) {
                statusMap[status.code] =
                    await upsertOne(
                        Status,
                        {
                            kode_status:
                                status.code,
                        },
                        {
                            id_role:
                                status.role
                                    ? roleMap[
                                        status.role
                                    ].id_role
                                    : null,
                            nama_status:
                                status.name,
                            urutan_status:
                                status.order,
                            id_status_next: null,
                            id_status_revision:
                                null,
                            id_status_rejected:
                                null,
                            is_initial:
                                status.initial,
                            is_final:
                                status.final,
                            is_active: "Y",
                        },
                        transaction
                    );
            }

            for (const status of statuses) {
                await statusMap[
                    status.code
                ].update(
                    {
                        id_status_next:
                            status.next
                                ? statusMap[
                                    status.next
                                ].id_status
                                : null,
                        id_status_revision:
                            status.revision
                                ? statusMap[
                                    status.revision
                                ].id_status
                                : null,
                        id_status_rejected:
                            status.rejected
                                ? statusMap[
                                    status.rejected
                                ].id_status
                                : null,
                    },
                    { transaction }
                );
            }

            return {
                roles:
                    data.m_role.length,
                projects:
                    data.m_project.length,
                jabatans:
                    data.m_jabatan.length,
                units:
                    data.m_unit.length,
                umk: data.m_umk.length,
                koef_tmk:
                    data.m_koef_tmk.length,
                hari_libur:
                    data.m_hari_libur.length,
                pegawai:
                    data.m_pegawai.length,
                petugas:
                    data.m_petugas.length,
                users:
                    data.m_user.length + 2,
                modules:
                    data.m_module.length,
                access_modules:
                    accessKeys.size,
                unit_roles:
                    data.m_unit_role.length,
                statuses:
                    statuses.length,
                admin: admin.username,
                super_admin:
                    superAdmin.username,
            };
}

async function initializeSystem(
    options = {}
) {
    if (options.transaction) {
        return await seedSystem(
            options.transaction
        );
    }

    return await sequelize.transaction(
        seedSystem
    );
}

async function run() {
    try {
        await sequelize.authenticate();
        const summary =
            await initializeSystem();
        console.log(
            "Inisialisasi data Excel berhasil:",
            summary
        );
    } catch (error) {
        console.error(
            "Inisialisasi data Excel gagal:",
            {
                name: error.name,
                message: error.message,
                table: error.table,
                fields: error.fields,
                database_message:
                    error.parent
                        ?.sqlMessage,
                validation_errors:
                    error.errors?.map(
                        (item) => ({
                            message:
                                item.message,
                            field:
                                item.path,
                            value:
                                item.value,
                            type:
                                item.type,
                        })
                    ),
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

module.exports = initializeSystem;
