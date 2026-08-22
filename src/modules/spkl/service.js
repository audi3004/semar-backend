const { Op } = require("sequelize");
const { sequelize, Spkl, SpklPetugas, Petugas, Unit, User, HariLibur, Lembur, Status } = require("../../models");
const getWorkflowScope = require("../../utils/workflowScope");
const { generateUnitDocumentNumber } = require("../../utils/documentNumber");
const AppError = require("../../utils/appError");
const masterLemburService = require("../masterLembur/service");

const include = [{ model: Unit, as: "unit" }, { model: User, as: "createdBy", attributes: ["id_user", "username"] }, { model: SpklPetugas, as: "assignments", include: [{ model: Petugas, as: "petugas", include: [{ model: Unit, as: "unit" }] }, { model: Lembur, as: "lembur", required: false, include: [{ model: Status, as: "status", required: false }] }] }];
const roleCode = (user) => String(user?.kode_role || "").toUpperCase();
const privileged = (user) => user?.is_super_admin === "Y" || ["SUPER_ADMIN", "ADMIN"].includes(roleCode(user));

class SpklService {
    assertRead(user) { if (!privileged(user) && !["CHECKER", "APPROVAL_1"].includes(roleCode(user))) throw new AppError("Role Anda tidak memiliki akses Perintah Kerja Lembur", 403); }
    assertWrite(user) { if (!privileged(user) && roleCode(user) !== "CHECKER") throw new AppError("Hanya Checker yang dapat mengelola Perintah Kerja Lembur", 403); }
    async scope(user) { return privileged(user) ? null : getWorkflowScope(user); }
    async assertUnit(idUnit, user) { const scope = await this.scope(user); if (scope && !scope.unitIds.includes(Number(idUnit))) throw new AppError("Unit berada di luar UnitRole Anda", 403); }
    async findAll(filters, user) {
        this.assertRead(user); const scope = await this.scope(user); const where = {};
        if (scope) where.id_unit = { [Op.in]: scope.unitIds };
        if (filters.id_unit) { await this.assertUnit(filters.id_unit, user); where.id_unit = Number(filters.id_unit); }
        if (filters.status_spkl) where.status_spkl = filters.status_spkl;
        if (filters.tgl_awal && filters.tgl_akhir) where.tgl_lembur = { [Op.between]: [filters.tgl_awal, filters.tgl_akhir] };
        return Spkl.findAll({ where, include, order: [["tgl_lembur", "DESC"], ["id_spkl", "DESC"]] });
    }
    async findOne(id, user) { this.assertRead(user); const row = await Spkl.findByPk(id, { include }); if (!row) throw new AppError("SPKL tidak ditemukan", 404); await this.assertUnit(row.id_unit, user); return row; }
    getWeekRange(dateValue) {
        const date = new Date(`${dateValue}T00:00:00Z`);
        const day = date.getUTCDay() || 7;
        const monday = new Date(date); monday.setUTCDate(date.getUTCDate() - day + 1);
        const sunday = new Date(date); sunday.setUTCDate(date.getUTCDate() + 7 - day);
        const monthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
        const monthEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
        const format = (value) => value.toISOString().slice(0, 10);
        return {
            start: format(monday < monthStart ? monthStart : monday),
            end: format(sunday > monthEnd ? monthEnd : sunday),
        };
    }
    async getOfficerAvailability(filters, user) {
        this.assertRead(user);
        const date = filters.tgl_lembur;
        const idUnit = Number(filters.id_unit);
        await this.assertUnit(idUnit, user);
        const petugas = await Petugas.findAll({ where: { id_unit: idUnit, is_active: "Y" }, order: [["nama", "ASC"]] });
        const ids = petugas.map((item) => item.id_petugas);
        if (!ids.length) return [];
        const week = this.getWeekRange(date);
        const [lemburRows, assignments] = await Promise.all([
            Lembur.findAll({
                where: { id_petugas: { [Op.in]: ids }, tgl_lembur: { [Op.between]: [week.start, week.end] } },
                attributes: ["id_petugas", "tgl_lembur", "total_jam", "jumlah_jam_koreksi"],
            }),
            SpklPetugas.findAll({
                where: { id_petugas: { [Op.in]: ids } },
                include: [{ model: Spkl, as: "spkl", required: true, where: { tgl_lembur: date, status_spkl: { [Op.ne]: "CANCELLED" } } }],
            }),
        ]);
        const excludedSpkl = Number(filters.exclude_id_spkl || 0);
        return petugas.map((item) => {
            const records = lemburRows.filter((row) => Number(row.id_petugas) === Number(item.id_petugas));
            const hours = (row) => Number(row.jumlah_jam_koreksi ?? row.total_jam ?? 0);
            const dailyHours = records.filter((row) => row.tgl_lembur === date).reduce((sum, row) => sum + hours(row), 0);
            const weeklyHours = records.reduce((sum, row) => sum + hours(row), 0);
            const assigned = assignments.some((assignment) => Number(assignment.id_petugas) === Number(item.id_petugas) && Number(assignment.id_spkl) !== excludedSpkl);
            return {
                id_petugas: item.id_petugas,
                daily_hours: dailyHours,
                weekly_hours: weeklyHours,
                assigned_on_date: assigned,
                can_assign: !assigned && dailyHours < 4 && weeklyHours < 18,
                week_start: week.start,
                week_end: week.end,
            };
        });
    }
    async validatePayload(data, user, excludeSpklId = null) {
        await this.assertUnit(data.id_unit, user);
        const master = await masterLemburService.resolve(data.id_kategori_lembur, data.id_jenis_pekerjaan_lembur);
        data.kategori_lembur = master.category.nama_kategori;
        data.jenis_pekerjaan = master.type?.nama_jenis || null;
        data.kode_jenis_pekerjaan = master.type?.kode_perilaku === "SIAGA_HARI_LIBUR" ? "SIAGA_HARI_LIBUR" : "REGULAR";
        const petugas = await Petugas.findAll({ where: { id_petugas: { [Op.in]: data.id_petugas }, is_active: "Y" } });
        if (petugas.length !== new Set(data.id_petugas.map(Number)).size) throw new AppError("Terdapat petugas yang tidak ditemukan atau tidak aktif", 422);
        const invalid = petugas.find((item) => Number(item.id_unit) !== Number(data.id_unit));
        if (invalid) throw new AppError(`Petugas ${invalid.nama} tidak berada pada unit SPKL`, 422);
        const availability = await this.getOfficerAvailability({ id_unit: data.id_unit, tgl_lembur: data.tgl_lembur, exclude_id_spkl: excludeSpklId }, user);
        const availabilityMap = new Map(availability.map((item) => [Number(item.id_petugas), item]));
        const unavailable = petugas.find((item) => !availabilityMap.get(Number(item.id_petugas))?.can_assign);
        if (unavailable) {
            const info = availabilityMap.get(Number(unavailable.id_petugas));
            if (info?.assigned_on_date) throw new AppError(`${unavailable.nama} sudah ter-assign lembur pada tanggal ${data.tgl_lembur}`, 409);
            throw new AppError(`${unavailable.nama} telah mencapai batas lembur (${info?.daily_hours || 0}/4 jam harian, ${info?.weekly_hours || 0}/18 jam mingguan)`, 422);
        }
        if (data.kode_jenis_pekerjaan === "SIAGA_HARI_LIBUR") {
            const holiday = await HariLibur.findOne({ where: { tanggal: data.tgl_lembur, is_active: "Y" } });
            if (!holiday) throw new AppError(`Tanggal ${data.tgl_lembur} tidak terdaftar sebagai hari libur aktif`, 422);
        }
    }
    async create(data, user) {
        this.assertWrite(user); await this.validatePayload(data, user);
        const nomor = await generateUnitDocumentNumber("SPKL", data.tgl_lembur, data.id_unit);
        const id = await sequelize.transaction(async (transaction) => {
            const row = await Spkl.create({ ...data, nomor_dokumen: nomor, created_by: user.id_user }, { transaction });
            await SpklPetugas.bulkCreate([...new Set(data.id_petugas.map(Number))].map((id_petugas) => ({ id_spkl: row.id_spkl, id_petugas })), { transaction });
            return row.id_spkl;
        }); return this.findOne(id, user);
    }
    async update(id, data, user) {
        this.assertWrite(user); const row = await this.findOne(id, user); await this.validatePayload(data, user, id);
        if (row.assignments.some((item) => item.lembur)) throw new AppError("SPKL yang sudah direalisasikan tidak dapat diubah", 409);
        await sequelize.transaction(async (transaction) => {
            await row.update({ ...data, nomor_dokumen: row.nomor_dokumen, updated_by: user.id_user }, { transaction });
            await SpklPetugas.destroy({ where: { id_spkl: id }, transaction });
            await SpklPetugas.bulkCreate([...new Set(data.id_petugas.map(Number))].map((id_petugas) => ({ id_spkl: id, id_petugas })), { transaction });
        }); return this.findOne(id, user);
    }
    async remove(id, user) { this.assertWrite(user); const row = await this.findOne(id, user); if (row.assignments.some((item) => item.lembur)) throw new AppError("SPKL yang sudah direalisasikan hanya dapat dibatalkan", 409); await row.destroy(); }
}
module.exports = new SpklService();
