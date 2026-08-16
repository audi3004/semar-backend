require("dotenv").config();
const { Op } = require("sequelize");
const { sequelize, Petugas, User, Role, Status, Unit, UnitRole, Project, PegawaiProject, Spkl, SpklPetugas, Lembur, Cuti, Ijin, Sakit, Sppd, LogLembur, LogCuti, LogIjin, LogSakit, LogSppd } = require("../models");

const MARKER = "[DUMMY-2M]";
const DAY = 86400000;
const isoDate = (date) => date.toISOString().slice(0, 10);
const daysAgo = (days) => isoDate(new Date(Date.now() - days * DAY));
const pad = (value) => String(value).padStart(4, "0");
const signature = (role) => `/uploads/dummy/signature-${role.toLowerCase().replaceAll("_", "-")}.png`;
const rowIds = (rows, key) => rows.map((row) => row[key]);

function validateSafety() {
    if (process.env.NODE_ENV === "production") throw new Error("Seeder dummy ditolak pada NODE_ENV=production");
    if (!process.env.DB_NAME) throw new Error("DB_NAME belum dikonfigurasi");
}

async function clearPreviousDummy(transaction) {
    const definitions = [[Lembur, "keterangan", "id_lembur"], [Cuti, "perihal", "id_cuti"], [Ijin, "agenda", "id_ijin"], [Sakit, "agenda", "id_sakit"], [Sppd, "maksud_dinas", "id_sppd"], [Spkl, "detail_pekerjaan", "id_spkl"]];
    const found = [];
    for (const [Model, field, key] of definitions) found.push(await Model.findAll({ where: { [field]: { [Op.like]: `${MARKER}%` } }, attributes: [key], raw: true, transaction }));
    const [lembur, cuti, ijin, sakit, sppd, spkl] = found;
    for (const [Model, key, rows, pk] of [[LogLembur, "id_lembur", lembur, "id_lembur"], [LogCuti, "id_cuti", cuti, "id_cuti"], [LogIjin, "id_ijin", ijin, "id_ijin"], [LogSakit, "id_sakit", sakit, "id_sakit"], [LogSppd, "id_sppd", sppd, "id_sppd"]]) if (rows.length) await Model.destroy({ where: { [key]: { [Op.in]: rowIds(rows, pk) } }, transaction });
    if (lembur.length) await Lembur.destroy({ where: { id_lembur: { [Op.in]: rowIds(lembur, "id_lembur") } }, transaction });
    if (spkl.length) {
        await SpklPetugas.destroy({ where: { id_spkl: { [Op.in]: rowIds(spkl, "id_spkl") } }, transaction });
        await Spkl.destroy({ where: { id_spkl: { [Op.in]: rowIds(spkl, "id_spkl") } }, transaction });
    }
    for (const [Model, key, rows] of [[Cuti, "id_cuti", cuti], [Ijin, "id_ijin", ijin], [Sakit, "id_sakit", sakit], [Sppd, "id_sppd", sppd]]) if (rows.length) await Model.destroy({ where: { [key]: { [Op.in]: rowIds(rows, key) } }, transaction });
}

function scopeResolver(units, roles, users, assignments, employeeProjects) {
    const unitMap = new Map(units.map((row) => [Number(row.id_unit), row]));
    const roleMap = new Map(roles.map((row) => [row.kode_role, row]));
    const userMap = new Map(users.map((row) => [Number(row.id_user), row]));
    const projectKeys = new Set(employeeProjects.map((row) => `${row.id_pegawai}:${row.id_project}`));
    const ancestors = (unitId) => { const result = []; let unit = unitMap.get(Number(unitId)); while (unit?.id_induk_unit) { result.push(Number(unit.id_induk_unit)); unit = unitMap.get(Number(unit.id_induk_unit)); } return result; };
    const resolve = (roleCode, unitId, projectId) => {
        const role = roleMap.get(roleCode); const parentIds = ancestors(unitId);
        const candidates = assignments.filter((row) => Number(row.id_role) === Number(role?.id_role)).filter((row) => Number(row.id_unit) === Number(unitId) || (row.scope_type === "SELF_AND_DESCENDANTS" && parentIds.includes(Number(row.id_unit)))).map((row) => userMap.get(Number(row.id_user))).filter((user) => user?.id_pegawai && projectKeys.has(`${user.id_pegawai}:${projectId}`)).sort((a, b) => a.id_user - b.id_user);
        if (!candidates.length) throw new Error(`Pegawai ${roleCode} untuk ${unitMap.get(Number(unitId))?.nama_unit} dan project ${projectId} tidak tersedia`);
        return { ...candidates[0], roleCode };
    };
    return { unitMap, resolve };
}

function workflowPlan(target, actors) {
    const step = (from, to, actor, action = "NEXT", note = "menyetujui pengajuan") => ({ from, to, actor, action, note });
    const maker = step("DRAFT", "WAITING_CHECKER", actors.MAKER, "NEXT", "mengirim pengajuan");
    const checker = step("WAITING_CHECKER", "WAITING_APPROVAL_1", actors.CHECKER, "NEXT", "menyetujui pengajuan; Verification otomatis dilewati karena tidak memiliki assignee aktif");
    const a1 = step("WAITING_APPROVAL_1", "WAITING_APPROVAL_2", actors.APPROVAL_1);
    const a2 = step("WAITING_APPROVAL_2", "WAITING_APPROVAL_3", actors.APPROVAL_2);
    const a3 = step("WAITING_APPROVAL_3", "APPROVED", actors.APPROVAL_3);
    return { DRAFT: [], WAITING_CHECKER: [maker], WAITING_APPROVAL_1: [maker, checker], WAITING_APPROVAL_2: [maker, checker, a1], WAITING_APPROVAL_3: [maker, checker, a1, a2], APPROVED: [maker, checker, a1, a2, a3], REVISION: [maker, step("WAITING_CHECKER", "REVISION", actors.CHECKER, "REVISION", "mengembalikan pengajuan")], REJECTED: [maker, step("WAITING_CHECKER", "REJECTED", actors.CHECKER, "REJECT", "menolak pengajuan")] }[target];
}

function signatures(plan) {
    const roles = new Set(plan.map((row) => row.actor.roleCode));
    return { maker_signature: signature("MAKER"), checker_signature: roles.has("CHECKER") ? signature("CHECKER") : null, verification_signature: null, approval_1_signature: roles.has("APPROVAL_1") ? signature("APPROVAL_1") : null, approval_2_signature: roles.has("APPROVAL_2") ? signature("APPROVAL_2") : null, approval_3_signature: roles.has("APPROVAL_3") ? signature("APPROVAL_3") : null };
}

async function createLogs(targets, plan, statuses, maker, createdAt, transaction) {
    let count = 0;
    for (const { Model, key, id } of targets) {
        await Model.create({ [key]: id, id_status_sebelum: null, id_status_sesudah: statuses.DRAFT.id_status, aksi: "CREATE", keterangan: `${MARKER} Dibuat oleh Petugas ${maker.username}`, created_by: maker.id_user, created_at: createdAt }, { transaction }); count++;
        for (let i = 0; i < plan.length; i++) { const item = plan[i]; await Model.create({ [key]: id, id_status_sebelum: statuses[item.from].id_status, id_status_sesudah: statuses[item.to].id_status, aksi: item.action, keterangan: `${MARKER} ${item.actor.roleCode} ${item.note} oleh ${item.actor.username}`, created_by: item.actor.id_user, created_at: new Date(createdAt.getTime() + (i + 1) * 3600000) }, { transaction }); count++; }
    }
    return count;
}

async function seedDummyTransactions() {
    validateSafety(); await sequelize.authenticate();
    return sequelize.transaction(async (transaction) => {
        await clearPreviousDummy(transaction); const raw = { raw: true, transaction };
        const petugas = await Petugas.findAll({ where: { is_active: "Y" }, order: [["id_petugas", "ASC"]], ...raw });
        const statusRows = await Status.findAll({ where: { is_active: "Y" }, ...raw });
        const projects = await Project.findAll({ where: { is_active: "Y" }, ...raw });
        const units = await Unit.findAll({ where: { is_active: "Y" }, ...raw });
        const users = await User.findAll({ where: { is_active: "Y" }, ...raw });
        const roles = await Role.findAll({ where: { is_active: "Y" }, ...raw });
        const unitRoles = await UnitRole.findAll({ where: { is_active: "Y" }, ...raw });
        const employeeProjects = await PegawaiProject.findAll({ where: { is_active: "Y" }, ...raw });
        if (!petugas.length) throw new Error("Petugas aktif belum tersedia. Jalankan seed:initialize terlebih dahulu.");
        const statuses = Object.fromEntries(statusRows.map((row) => [row.kode_status, row]));
        const targetCycle = ["DRAFT", "WAITING_CHECKER", "WAITING_APPROVAL_1", "WAITING_APPROVAL_2", "WAITING_APPROVAL_3", "APPROVED", "REVISION", "REJECTED"];
        for (const code of targetCycle) if (!statuses[code]) throw new Error(`Status ${code} belum tersedia`);
        const projectMap = new Map(projects.map((row) => [Number(row.id_project), row]));
        const makerMap = new Map(users.filter((row) => row.id_petugas).map((row) => [Number(row.id_petugas), { ...row, roleCode: "MAKER" }]));
        const { unitMap, resolve } = scopeResolver(units, roles, users, unitRoles, employeeProjects);
        const parents = new Set(units.filter((row) => row.id_induk_unit).map((row) => Number(row.id_induk_unit)));
        const approverSets = Object.fromEntries(["CHECKER", "APPROVAL_1", "APPROVAL_2", "APPROVAL_3"].map((role) => [role, new Set()]));
        const summary = { petugas: petugas.length, spkl: 0, lembur: 0, cuti: 0, ijin: 0, sakit: 0, sppd: 0, logs: 0, period_start: daysAgo(60), period_end: daysAgo(0), statuses: {} };
        for (let index = 0; index < petugas.length; index++) {
            const officer = petugas[index], unit = unitMap.get(Number(officer.id_unit)), project = projectMap.get(Number(officer.id_project)), maker = makerMap.get(Number(officer.id_petugas));
            if (!unit || parents.has(Number(unit.id_unit)) || !/^GI\s/i.test(unit.nama_unit)) throw new Error(`Unit Petugas ${officer.nip} bukan unit GI leaf`);
            if (!project || !maker) throw new Error(`Maker/project Petugas ${officer.nip} tidak valid`);
            const actors = { MAKER: maker };
            for (const role of Object.keys(approverSets)) { actors[role] = resolve(role, officer.id_unit, officer.id_project); approverSets[role].add(actors[role].id_user); }
            const target = targetCycle[index % targetCycle.length], plan = workflowPlan(target, actors), sig = signatures(plan), serial = pad(index + 1);
            const baseDays = (index * 7) % 59, overtimeDate = daysAgo(baseDays), absenceDate = daysAgo((baseDays + 2) % 60), travelDate = daysAgo((baseDays + 4) % 60), createdAt = new Date(`${overtimeDate}T08:00:00+07:00`);
            const spkl = await Spkl.create({ nomor_dokumen: `DMY-SPKL-${serial}`, id_unit: officer.id_unit, tgl_lembur: overtimeDate, kategori_lembur: index % 5 ? "Pekerjaan Tower" : "Emergency / Pelacakan Gangguan", jenis_pekerjaan: index % 5 ? "Assesment Kondisi Tower" : "Penanganan gangguan dummy", kode_jenis_pekerjaan: "REGULAR", area_group: unit.nama_unit, detail_pekerjaan: `${MARKER} SPKL Checker untuk Petugas ${officer.nama} di ${unit.nama_unit}`, status_spkl: "COMPLETED", created_by: actors.CHECKER.id_user, created_at: new Date(createdAt.getTime() - 3600000) }, { transaction });
            const assignment = await SpklPetugas.create({ id_spkl: spkl.id_spkl, id_petugas: officer.id_petugas, status_penugasan: "SUBMITTED", created_at: createdAt }, { transaction });
            const common = { id_petugas: officer.id_petugas, id_project: officer.id_project, id_status: statuses[target].id_status, ...sig, created_by: maker.id_user, created_at: createdAt };
            const lembur = await Lembur.create({ ...common, dasar_lembur_type: "SPKL", id_spkl_petugas: assignment.id_spkl_petugas, tgl_lembur: overtimeDate, jam_mulai: "18:00:00", jam_selesai: `${20 + index % 3}:00:00`, total_jam: 2 + index % 3, biaya_lembur: 100000 + index * 1000, kategori_lembur: spkl.kategori_lembur, jenis_pekerjaan: spkl.jenis_pekerjaan, area_group: unit.nama_unit, is_hari_libur: "N", detail_pekerjaan_lembur: `${MARKER} Realisasi ${spkl.nomor_dokumen}`, foto_kegiatan_1: "/uploads/dummy/foto-kegiatan-1.jpg", foto_kegiatan_2: "/uploads/dummy/foto-kegiatan-2.jpg", surat_perintah_lembur: "/uploads/dummy/surat-perintah.pdf", nomor_dokumen: `DMY-LMB-${serial}`, keterangan: `${MARKER} Lembur ${officer.nama} di ${unit.nama_unit}` }, { transaction });
            const cuti = await Cuti.create({ ...common, no_cuti: `DMY-CUTI-${serial}`, tgl_pengajuan: absenceDate, jenis_cuti: index % 2 ? "Cuti Tahunan" : "Cuti Keperluan Pribadi", perihal: `${MARKER} Cuti ${officer.nama}`, tgl_mulai: absenceDate, tgl_selesai: absenceDate, lama_hari: 1, contact_alamat: unit.nama_unit, nomor_telepon_darurat: "081234567890" }, { transaction });
            const ijin = await Ijin.create({ ...common, nomor_dokumen: `DMY-IJIN-${serial}`, agenda: `${MARKER} Ijin ${officer.nama}`, tanggal: absenceDate, tgl_selesai: absenceDate, foto: "/uploads/dummy/foto-ijin.jpg", jumlah_hari_disetujui: target === "APPROVED" ? 1 : null, keterangan: `Unit ${unit.nama_unit}` }, { transaction });
            const sakit = await Sakit.create({ ...common, nomor_dokumen: `DMY-SAKIT-${serial}`, agenda: `${MARKER} Sakit ${officer.nama}`, tanggal: absenceDate, tgl_selesai: absenceDate, foto: "/uploads/dummy/surat-dokter.jpg", nama_dokter: "dr. Dummy", keterangan: `Unit ${unit.nama_unit}` }, { transaction });
            const sppd = await Sppd.create({ ...common, no_sppd: `DMY-SPPD-${serial}`, nomor_dokumen: `DMY-SPPD-DOC-${serial}`, kota_asal: unit.nama_unit, kota_tujuan: index % 2 ? "Semarang" : "Purwokerto", maksud_dinas: `${MARKER} SPPD ${officer.nama}`, tgl_berangkat: travelDate, tgl_kembali: travelDate, lama_dinas: 1, beban_anggaran: project.nama_project, rp_akomodasi: 150000, desc_akomodasi: "Akomodasi dummy", rp_transportasi: 200000, desc_transportasi: "Transport dummy", rp_lain_lain: 50000, desc_lain_lain: "Biaya dummy" }, { transaction });
            summary.logs += await createLogs([{ Model: LogLembur, key: "id_lembur", id: lembur.id_lembur }, { Model: LogCuti, key: "id_cuti", id: cuti.id_cuti }, { Model: LogIjin, key: "id_ijin", id: ijin.id_ijin }, { Model: LogSakit, key: "id_sakit", id: sakit.id_sakit }, { Model: LogSppd, key: "id_sppd", id: sppd.id_sppd }], plan, statuses, maker, createdAt, transaction);
            for (const type of ["spkl", "lembur", "cuti", "ijin", "sakit", "sppd"]) summary[type]++; summary.statuses[target] = (summary.statuses[target] || 0) + 5;
        }
        summary.approvers = Object.fromEntries(Object.entries(approverSets).map(([role, values]) => [role, values.size])); return summary;
    });
}

async function run() { try { console.log("Seeder transaksi dummy berhasil:", await seedDummyTransactions()); } catch (error) { console.error("Seeder transaksi dummy gagal:", error); process.exitCode = 1; } finally { await sequelize.close(); } }
if (require.main === module) run();
module.exports = seedDummyTransactions;
