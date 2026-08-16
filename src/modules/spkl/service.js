const { Op } = require("sequelize");
const { sequelize, Spkl, SpklPetugas, Petugas, Unit, User, HariLibur, Lembur } = require("../../models");
const getWorkflowScope = require("../../utils/workflowScope");
const { generateUnitDocumentNumber } = require("../../utils/documentNumber");
const AppError = require("../../utils/appError");

const include = [{ model: Unit, as: "unit" }, { model: User, as: "createdBy", attributes: ["id_user", "username"] }, { model: SpklPetugas, as: "assignments", include: [{ model: Petugas, as: "petugas", include: [{ model: Unit, as: "unit" }] }, { model: Lembur, as: "lembur", required: false }] }];
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
    async validatePayload(data, user) {
        await this.assertUnit(data.id_unit, user);
        const petugas = await Petugas.findAll({ where: { id_petugas: { [Op.in]: data.id_petugas }, is_active: "Y" } });
        if (petugas.length !== new Set(data.id_petugas.map(Number)).size) throw new AppError("Terdapat petugas yang tidak ditemukan atau tidak aktif", 422);
        const invalid = petugas.find((item) => Number(item.id_unit) !== Number(data.id_unit));
        if (invalid) throw new AppError(`Petugas ${invalid.nama} tidak berada pada unit SPKL`, 422);
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
        this.assertWrite(user); const row = await this.findOne(id, user); await this.validatePayload(data, user);
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
