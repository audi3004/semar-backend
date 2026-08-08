const sequelize = require(
    "../config/database"
);

const Role = require("./role");
const Project = require("./project");
const Jabatan = require("./jabatan");
const Umk = require("./umk");
const KoefTmk = require(
    "./koefTmk"
);
const Gaji = require("./gaji");
const HariLibur = require(
    "./hariLibur"
);
const Unit = require("./unit");
const UnitRole = require(
    "./unitRole"
);
const Pegawai = require("./pegawai");
const Petugas = require("./petugas");
const User = require("./user");
const Module = require("./module");
const AccessModule = require(
    "./accessModule"
);

const Status = require(
    "./status"
);
const Mutasi = require("./mutasi");
const Lembur = require("./lembur");
const LogLembur = require(
    "./logLembur"
);
const Cuti = require("./cuti");
const LogCuti = require(
    "./logCuti"
);
const Ijin = require("./ijin");
const LogIjin = require(
    "./logIjin"
);
const Sakit = require("./sakit");
const LogSakit = require(
    "./logSakit"
);
const Sppd = require("./sppd");
const LogSppd = require(
    "./logSppd"
);




Role.hasMany(User, {
    foreignKey: "id_role",
    as: "users",
});

User.belongsTo(Role, {
    foreignKey: "id_role",
    as: "role",
});

/*
|--------------------------------------------------------------------------
| PROJECT → JABATAN
|--------------------------------------------------------------------------
|
| Satu project memiliki banyak jabatan.
| Satu jabatan berada pada satu project.
|
*/

Project.hasMany(Jabatan, {
    foreignKey: "id_project",
    as: "jabatans",
});

Jabatan.belongsTo(Project, {
    foreignKey: "id_project",
    as: "project",
});

/*
|--------------------------------------------------------------------------
| UMK → GAJI
|--------------------------------------------------------------------------
|
| Satu UMK dapat digunakan oleh banyak golongan gaji.
| Satu golongan gaji mengacu pada satu UMK.
|
*/

Umk.hasMany(Gaji, {
    foreignKey: "id_umk",
    as: "gajis",
});

Gaji.belongsTo(Umk, {
    foreignKey: "id_umk",
    as: "umk",
});

/*
|--------------------------------------------------------------------------
| KOEF TMK → GAJI
|--------------------------------------------------------------------------
|
| Satu koefisien TMK dapat digunakan oleh banyak golongan gaji.
| Satu golongan gaji mengacu pada satu koefisien TMK.
|
*/


KoefTmk.hasMany(Gaji, {
    foreignKey: "id_koef_tmk",
    sourceKey: "id_koef_tmk",
    as: "gajis",
});

Gaji.belongsTo(KoefTmk, {
    foreignKey: "id_koef_tmk",
    targetKey: "id_koef_tmk",
    as: "koefTmk",
});

/*
|--------------------------------------------------------------------------
| GAJI → PETUGAS
|--------------------------------------------------------------------------
|
| Satu golongan gaji dapat digunakan oleh banyak petugas.
| Satu petugas mengacu pada satu golongan gaji.
|
*/

Umk.hasMany(Petugas, {
    foreignKey: "id_umk",
    as: "petugas",
});

Petugas.belongsTo(Umk, {
    foreignKey: "id_umk",
    as: "umk",
});




/*
|--------------------------------------------------------------------------
| UNIT → UNIT
|--------------------------------------------------------------------------
|
| Relasi hierarchy/self-reference:
|
| Unit induk memiliki banyak unit anak.
| Unit anak dapat memiliki satu unit induk.
|
*/

Unit.hasMany(Unit, {
    foreignKey: "id_induk_unit",
    as: "subUnits",
});

Unit.belongsTo(Unit, {
    foreignKey: "id_induk_unit",
    as: "indukUnit",
});

/*
|--------------------------------------------------------------------------
| JABATAN → PEGAWAI
|--------------------------------------------------------------------------
|
| Satu jabatan dapat dimiliki banyak pegawai.
| Satu pegawai memiliki satu jabatan.
|
*/

Jabatan.hasMany(Pegawai, {
    foreignKey: "id_jabatan",
    as: "pegawais",
});

Pegawai.belongsTo(Jabatan, {
    foreignKey: "id_jabatan",
    as: "jabatan",
});

/*
|--------------------------------------------------------------------------
| UNIT → PEGAWAI
|--------------------------------------------------------------------------
|
| Satu unit memiliki banyak pegawai.
| Satu pegawai berada pada satu unit aktif.
|
*/

Unit.hasMany(Pegawai, {
    foreignKey: "id_unit",
    as: "pegawais",
});

Pegawai.belongsTo(Unit, {
    foreignKey: "id_unit",
    as: "unit",
});

/*
|--------------------------------------------------------------------------
| UNIT → PETUGAS
|--------------------------------------------------------------------------
|
| Satu unit memiliki banyak petugas.
| Satu petugas berada pada satu unit.
|
*/

Unit.hasMany(Petugas, {
    foreignKey: "id_unit",
    as: "petugas",
});

Petugas.belongsTo(Unit, {
    foreignKey: "id_unit",
    as: "unit",
});


/*
|--------------------------------------------------------------------------
| USER - UNIT ROLE
|--------------------------------------------------------------------------
*/

User.hasMany(UnitRole, {
    foreignKey: "id_user",
    as: "unitRoles",
});

UnitRole.belongsTo(User, {
    foreignKey: "id_user",
    as: "user",
});

/*
|--------------------------------------------------------------------------
| UNIT - UNIT ROLE
|--------------------------------------------------------------------------
*/

Unit.hasMany(UnitRole, {
    foreignKey: "id_unit",
    as: "unitRoles",
});

UnitRole.belongsTo(Unit, {
    foreignKey: "id_unit",
    as: "unit",
});


/*
|--------------------------------------------------------------------------
| USER - APPROVAL
|--------------------------------------------------------------------------
*/

User.belongsToMany(Unit, {
    through: UnitRole,
    foreignKey: "id_user",
    otherKey: "id_unit",
    as: "approvalUnits",
});

Unit.belongsToMany(User, {
    through: UnitRole,
    foreignKey: "id_unit",
    otherKey: "id_user",
    as: "approvalUsers",
});

/*
|--------------------------------------------------------------------------
| ROLE - UNIT ROLE
|--------------------------------------------------------------------------
*/

Role.hasMany(UnitRole, {
    foreignKey: "id_role",
    as: "unitRoles",
});

UnitRole.belongsTo(Role, {
    foreignKey: "id_role",
    as: "role",
});

/*
|--------------------------------------------------------------------------
| JABATAN → PETUGAS
|--------------------------------------------------------------------------
|
| Satu jabatan dapat dimiliki banyak petugas.
| Jabatan petugas dapat bernilai null.
|
*/

Jabatan.hasMany(Petugas, {
    foreignKey: "id_jabatan",
    as: "petugas",
});

Petugas.belongsTo(Jabatan, {
    foreignKey: "id_jabatan",
    as: "jabatan",
});

/*
|--------------------------------------------------------------------------
| PEGAWAI → USER
|--------------------------------------------------------------------------
|
| Satu pegawai maksimal memiliki satu akun user.
| User dapat tidak terhubung dengan pegawai.
|
*/

Pegawai.hasOne(User, {
    foreignKey: "id_pegawai",
    as: "user",
});

User.belongsTo(Pegawai, {
    foreignKey: "id_pegawai",
    as: "pegawai",
});

/*
|--------------------------------------------------------------------------
| PETUGAS → USER
|--------------------------------------------------------------------------
|
| Satu petugas maksimal memiliki satu akun user.
| User dapat tidak terhubung dengan petugas.
|
*/

Petugas.hasOne(User, {
    foreignKey: "id_petugas",
    as: "user",
});

User.belongsTo(Petugas, {
    foreignKey: "id_petugas",
    as: "petugas",
});

/*
|--------------------------------------------------------------------------
| ROLE → ACCESS MODULE
|--------------------------------------------------------------------------
|
| Satu role memiliki banyak pengaturan akses module.
|
*/

Role.hasMany(AccessModule, {
    foreignKey: "id_role",
    as: "accessModules",
});

AccessModule.belongsTo(Role, {
    foreignKey: "id_role",
    as: "role",
});

/*
|--------------------------------------------------------------------------
| ROLE - STATUS
|--------------------------------------------------------------------------
*/

Role.hasMany(Status, {
    foreignKey: "id_role",
    as: "statuses",
});

Status.belongsTo(Role, {
    foreignKey: "id_role",
    as: "role",
});

/*
|--------------------------------------------------------------------------
| STATUS NEXT
|--------------------------------------------------------------------------
*/

Status.belongsTo(Status, {
    foreignKey:
        "id_status_next",
    as: "nextStatus",
});

Status.hasMany(Status, {
    foreignKey:
        "id_status_next",
    as: "previousStatuses",
});


/*
|--------------------------------------------------------------------------
| STATUS REVISION
|--------------------------------------------------------------------------
*/

Status.belongsTo(Status, {
    foreignKey:
        "id_status_revision",
    as: "revisionStatus",
});

Status.hasMany(Status, {
    foreignKey:
        "id_status_revision",
    as: "revisionSources",
});

/*
|--------------------------------------------------------------------------
| STATUS REJECTED
|--------------------------------------------------------------------------
*/

Status.belongsTo(Status, {
    foreignKey:
        "id_status_rejected",
    as: "rejectedStatus",
});

Status.hasMany(Status, {
    foreignKey:
        "id_status_rejected",
    as: "rejectedSources",
});

/*
|--------------------------------------------------------------------------
| MODULE → ACCESS MODULE
|--------------------------------------------------------------------------
|
| Satu module dapat diberikan kepada banyak role.
|
*/

Module.hasMany(AccessModule, {
    foreignKey: "id_module",
    as: "accessModules",
});

AccessModule.belongsTo(Module, {
    foreignKey: "id_module",
    as: "module",
});

/*
|--------------------------------------------------------------------------
| ROLE ↔ MODULE
|--------------------------------------------------------------------------
|
| Relasi many-to-many melalui tabel AccessModule.
|
| Relasi ini bersifat opsional, tetapi berguna saat ingin mengambil:
|
| role.getModules()
| module.getRoles()
|
| Data permission tetap berada di AccessModule:
| can_create, can_read, can_update, can_delete, can_approve.
|
*/

Role.belongsToMany(Module, {
    through: AccessModule,
    foreignKey: "id_role",
    otherKey: "id_module",
    as: "modules",
});

Module.belongsToMany(Role, {
    through: AccessModule,
    foreignKey: "id_module",
    otherKey: "id_role",
    as: "roles",
});

/*
|--------------------------------------------------------------------------
| PEGAWAI → MUTASI
|--------------------------------------------------------------------------
|
| Riwayat mutasi hanya disimpan di tabel t_mutasi.
|
| m_pegawai tidak memiliki id_mutasi.
|
*/

Pegawai.hasMany(Mutasi, {
    foreignKey: "id_pegawai",
    as: "mutasi",
});

Mutasi.belongsTo(Pegawai, {
    foreignKey: "id_pegawai",
    as: "pegawai",
});

Petugas.hasMany(Mutasi, {
    foreignKey: "id_petugas",
    as: "mutasi",
});

Mutasi.belongsTo(Petugas, {
    foreignKey: "id_petugas",
    as: "petugas",
});

/*
|--------------------------------------------------------------------------
| UNIT → MUTASI
|--------------------------------------------------------------------------
|
| id_unit pada mutasi menunjukkan unit tujuan mutasi.
|
*/

Unit.hasMany(Mutasi, {
    foreignKey: "id_unit_sebelum",
    as: "mutasiAsal",
});

Mutasi.belongsTo(Unit, {
    foreignKey: "id_unit_sebelum",
    as: "unitSebelum",
});

Unit.hasMany(Mutasi, {
    foreignKey: "id_unit_sesudah",
    as: "mutasiTujuan",
});

Mutasi.belongsTo(Unit, {
    foreignKey: "id_unit_sesudah",
    as: "unitSesudah",
});

/*
|--------------------------------------------------------------------------
| PEGAWAI → LEMBUR
|--------------------------------------------------------------------------
*/

Petugas.hasMany(Lembur, {
    foreignKey: "id_petugas",
    as: "lemburs",
});

Lembur.belongsTo(Petugas, {
    foreignKey: "id_petugas",
    as: "petugas",
});

/*
|--------------------------------------------------------------------------
| STATUS → LEMBUR
|--------------------------------------------------------------------------
*/

Status.hasMany(Lembur, {
    foreignKey: "id_status",
    as: "lemburs",
});

Lembur.belongsTo(Status, {
    foreignKey: "id_status",
    as: "status",
});

Petugas.hasMany(Lembur, {
    foreignKey: "id_petugas_cuti",
    as: "lemburPenggantiCuti",
});

Lembur.belongsTo(Petugas, {
    foreignKey: "id_petugas_cuti",
    as: "petugasCuti",
});

/*
|--------------------------------------------------------------------------
| LEMBUR → LOG LEMBUR
|--------------------------------------------------------------------------
|
| Relasi tidak menggunakan constraint agar ID dan snapshot transaksi
| tetap tersimpan ketika data lembur utama dihapus.
|
*/

Lembur.hasMany(LogLembur, {
    foreignKey: "id_lembur",
    as: "logs",
    constraints: false,
});

LogLembur.belongsTo(Lembur, {
    foreignKey: "id_lembur",
    as: "lembur",
    constraints: false,
});

Status.hasMany(LogLembur, {
    foreignKey:
        "id_status_sebelum",
    as: "logLemburSebelum",
});

LogLembur.belongsTo(Status, {
    foreignKey:
        "id_status_sebelum",
    as: "statusSebelum",
});

Status.hasMany(LogLembur, {
    foreignKey:
        "id_status_sesudah",
    as: "logLemburSesudah",
});

LogLembur.belongsTo(Status, {
    foreignKey:
        "id_status_sesudah",
    as: "statusSesudah",
});

User.hasMany(LogLembur, {
    foreignKey: "created_by",
    as: "logLembur",
});

LogLembur.belongsTo(User, {
    foreignKey: "created_by",
    as: "createdBy",
});

/*
|--------------------------------------------------------------------------
| PEGAWAI → CUTI
|--------------------------------------------------------------------------
*/

Petugas.hasMany(Cuti, {
    foreignKey: "id_petugas",
    as: "cutis",
});

Cuti.belongsTo(Petugas, {
    foreignKey: "id_petugas",
    as: "petugas",
});

// 
// |--------------------------------------------------------------------------
// | STATUS → CUTI
// |--------------------------------------------------------------------------
//

Status.hasMany(Cuti, {
    foreignKey: "id_status",
    as: "cutis",
});

Cuti.belongsTo(Status, {
    foreignKey: "id_status",
    as: "status",
});

/*
|--------------------------------------------------------------------------
| CUTI → LOG CUTI
|--------------------------------------------------------------------------
|
| Log menyimpan seluruh perubahan transaksi cuti.
| Relasi tidak menggunakan constraint agar ID dan snapshot transaksi
| tetap tersimpan ketika data cuti utama dihapus.
|
*/

Cuti.hasMany(LogCuti, {
    foreignKey: "id_cuti",
    as: "logs",
    constraints: false,
});

LogCuti.belongsTo(Cuti, {
    foreignKey: "id_cuti",
    as: "cuti",
    constraints: false,
});

Status.hasMany(LogCuti, {
    foreignKey:
        "id_status_sebelum",
    as: "logCutiSebelum",
});

LogCuti.belongsTo(Status, {
    foreignKey:
        "id_status_sebelum",
    as: "statusSebelum",
});

Status.hasMany(LogCuti, {
    foreignKey:
        "id_status_sesudah",
    as: "logCutiSesudah",
});

LogCuti.belongsTo(Status, {
    foreignKey:
        "id_status_sesudah",
    as: "statusSesudah",
});

User.hasMany(LogCuti, {
    foreignKey: "created_by",
    as: "logCuti",
});

LogCuti.belongsTo(User, {
    foreignKey: "created_by",
    as: "createdBy",
});

/*
|--------------------------------------------------------------------------
| PETUGAS → IJIN
|--------------------------------------------------------------------------
*/

Petugas.hasMany(Ijin, {
    foreignKey: "id_petugas",
    as: "ijins",
});

Ijin.belongsTo(Petugas, {
    foreignKey: "id_petugas",
    as: "petugas",
});

/*
|--------------------------------------------------------------------------
| STATUS → IJIN
|--------------------------------------------------------------------------
*/

Status.hasMany(Ijin, {
    foreignKey: "id_status",
    as: "ijins",
});

Ijin.belongsTo(Status, {
    foreignKey: "id_status",
    as: "status",
});

/*
|--------------------------------------------------------------------------
| IJIN → LOG IJIN
|--------------------------------------------------------------------------
|
| Relasi tidak menggunakan constraint agar ID dan snapshot transaksi
| tetap tersimpan ketika data ijin utama dihapus.
|
*/

Ijin.hasMany(LogIjin, {
    foreignKey: "id_ijin",
    as: "logs",
    constraints: false,
});

LogIjin.belongsTo(Ijin, {
    foreignKey: "id_ijin",
    as: "ijin",
    constraints: false,
});

Status.hasMany(LogIjin, {
    foreignKey:
        "id_status_sebelum",
    as: "logIjinSebelum",
});

LogIjin.belongsTo(Status, {
    foreignKey:
        "id_status_sebelum",
    as: "statusSebelum",
});

Status.hasMany(LogIjin, {
    foreignKey:
        "id_status_sesudah",
    as: "logIjinSesudah",
});

LogIjin.belongsTo(Status, {
    foreignKey:
        "id_status_sesudah",
    as: "statusSesudah",
});

User.hasMany(LogIjin, {
    foreignKey: "created_by",
    as: "logIjin",
});

LogIjin.belongsTo(User, {
    foreignKey: "created_by",
    as: "createdBy",
});


/*
|--------------------------------------------------------------------------
| PETUGAS → SAKIT
|--------------------------------------------------------------------------
*/

Petugas.hasMany(Sakit, {
    foreignKey: "id_petugas",
    as: "sakits",
});

Sakit.belongsTo(Petugas, {
    foreignKey: "id_petugas",
    as: "petugas",
});

/*
|--------------------------------------------------------------------------
| STATUS → SAKIT
|--------------------------------------------------------------------------
*/

Status.hasMany(Sakit, {
    foreignKey: "id_status",
    as: "sakits",
});

Sakit.belongsTo(Status, {
    foreignKey: "id_status",
    as: "status",
});

/*
|--------------------------------------------------------------------------
| SAKIT → LOG SAKIT
|--------------------------------------------------------------------------
|
| Relasi tidak menggunakan constraint agar ID dan snapshot transaksi
| tetap tersimpan ketika data sakit utama dihapus.
|
*/

Sakit.hasMany(LogSakit, {
    foreignKey: "id_sakit",
    as: "logs",
    constraints: false,
});

LogSakit.belongsTo(Sakit, {
    foreignKey: "id_sakit",
    as: "sakit",
    constraints: false,
});

Status.hasMany(LogSakit, {
    foreignKey:
        "id_status_sebelum",
    as: "logSakitSebelum",
});

LogSakit.belongsTo(Status, {
    foreignKey:
        "id_status_sebelum",
    as: "statusSebelum",
});

Status.hasMany(LogSakit, {
    foreignKey:
        "id_status_sesudah",
    as: "logSakitSesudah",
});

LogSakit.belongsTo(Status, {
    foreignKey:
        "id_status_sesudah",
    as: "statusSesudah",
});

User.hasMany(LogSakit, {
    foreignKey: "created_by",
    as: "logSakit",
});

LogSakit.belongsTo(User, {
    foreignKey: "created_by",
    as: "createdBy",
});

/*
|--------------------------------------------------------------------------
| PETUGAS → SPPD
|--------------------------------------------------------------------------
*/

Petugas.hasMany(Sppd, {
    foreignKey: "id_petugas",
    as: "sppds",
});

Sppd.belongsTo(Petugas, {
    foreignKey: "id_petugas",
    as: "petugas",
});

/*
|--------------------------------------------------------------------------
| STATUS → SPPD
|--------------------------------------------------------------------------
*/


Status.hasMany(Sppd, {
    foreignKey: "id_status",
    as: "sppds",
});

Sppd.belongsTo(Status, {
    foreignKey: "id_status",
    as: "status",
});

/*
|--------------------------------------------------------------------------
| SPPD → LOG SPPD
|--------------------------------------------------------------------------
|
| Relasi tidak menggunakan constraint agar ID dan snapshot transaksi
| tetap tersimpan ketika data SPPD utama dihapus.
|
*/

Sppd.hasMany(LogSppd, {
    foreignKey: "id_sppd",
    as: "logs",
    constraints: false,
});

LogSppd.belongsTo(Sppd, {
    foreignKey: "id_sppd",
    as: "sppd",
    constraints: false,
});

Status.hasMany(LogSppd, {
    foreignKey:
        "id_status_sebelum",
    as: "logSppdSebelum",
});

LogSppd.belongsTo(Status, {
    foreignKey:
        "id_status_sebelum",
    as: "statusSebelum",
});

Status.hasMany(LogSppd, {
    foreignKey:
        "id_status_sesudah",
    as: "logSppdSesudah",
});

LogSppd.belongsTo(Status, {
    foreignKey:
        "id_status_sesudah",
    as: "statusSesudah",
});

User.hasMany(LogSppd, {
    foreignKey: "created_by",
    as: "logSppd",
});

LogSppd.belongsTo(User, {
    foreignKey: "created_by",
    as: "createdBy",
});


/*
|--------------------------------------------------------------------------
| Export sequelize dan seluruh model
|--------------------------------------------------------------------------
*/

module.exports = {
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
    Module,
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
};
