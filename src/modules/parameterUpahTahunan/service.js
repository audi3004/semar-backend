const { ParameterUpahTahunan } = require("../../models");
const AppError = require("../../utils/appError");

class ParameterUpahTahunanService {
    findAll(filters = {}) {
        const where = {};
        if (filters.tahun) where.tahun = filters.tahun;
        if (filters.status) where.status = filters.status;
        return ParameterUpahTahunan.findAll({ where, order: [["tahun", "DESC"]] });
    }

    async findById(id) {
        const record = await ParameterUpahTahunan.findByPk(id);
        if (!record) throw new AppError("Parameter upah tahunan tidak ditemukan", 404);
        return record;
    }

    async create(data, userId) {
        const existing = await ParameterUpahTahunan.findOne({ where: { tahun: data.tahun } });
        if (existing) throw new AppError(`Parameter upah tahun ${data.tahun} sudah tersedia`, 409);
        return ParameterUpahTahunan.create({ ...data, created_by: userId });
    }

    async update(id, data, userId) {
        const record = await this.findById(id);
        if (data.tahun && Number(data.tahun) !== Number(record.tahun)) {
            const existing = await ParameterUpahTahunan.findOne({ where: { tahun: data.tahun } });
            if (existing) throw new AppError(`Parameter upah tahun ${data.tahun} sudah tersedia`, 409);
        }
        await record.update({ ...data, updated_by: userId });
        return record;
    }
}

module.exports = new ParameterUpahTahunanService();
