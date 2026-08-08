const {
    Op,
} = require("sequelize");

const {
    HariLibur,
} = require("../../models");

class HariLiburRepository {
    async findAll(filters = {}) {
        const where = {};

        if (filters.tahun) {
            where.tanggal = {
                [Op.between]: [
                    `${filters.tahun}-01-01`,
                    `${filters.tahun}-12-31`,
                ],
            };
        }

        if (filters.nama_hari_libur) {
            where.nama_hari_libur = {
                [Op.like]:
                    `%${filters.nama_hari_libur}%`,
            };
        }

        if (filters.is_active) {
            where.is_active =
                filters.is_active;
        }

        return await HariLibur.findAll({
            where,
            order: [["tanggal", "ASC"]],
        });
    }

    async findById(id_hari_libur) {
        return await HariLibur.findByPk(
            id_hari_libur
        );
    }

    async findByDate(
        tanggal,
        excludeId = null
    ) {
        const where = { tanggal };

        if (excludeId) {
            where.id_hari_libur = {
                [Op.ne]: excludeId,
            };
        }

        return await HariLibur.findOne({
            where,
        });
    }

    async create(data, created_by) {
        return await HariLibur.create({
            ...data,
            created_by,
        });
    }

    async update(
        id_hari_libur,
        data,
        updated_by
    ) {
        await HariLibur.update(
            {
                ...data,
                updated_by,
            },
            {
                where: { id_hari_libur },
            }
        );

        return await this.findById(
            id_hari_libur
        );
    }

    async delete(id_hari_libur) {
        return await HariLibur.destroy({
            where: { id_hari_libur },
        });
    }
}

module.exports =
    new HariLiburRepository();
