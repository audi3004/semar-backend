const { Op } = require("sequelize");

const {
    Umk,
} = require("../../models");

class UmkRepository {
    async findAll(filters = {}) {
        const where = {};

        if (filters.jenis_wilayah) {
            where.jenis_wilayah =
                filters.jenis_wilayah;
        }

        if (filters.nama_wilayah) {
            where.nama_wilayah = {
                [Op.like]:
                    `%${filters.nama_wilayah}%`,
            };
        }

        if (filters.tahun_umk) {
            where.tahun_umk =
                filters.tahun_umk;
        }

        if (filters.is_active) {
            where.is_active =
                filters.is_active;
        }

        return await Umk.findAll({
            where,
            order: [
                [
                    "tahun_umk",
                    "DESC",
                ],
                [
                    "jenis_wilayah",
                    "ASC",
                ],
                [
                    "nama_wilayah",
                    "ASC",
                ],
            ],
        });
    }

    async findById(id_umk) {
        return await Umk.findByPk(
            id_umk
        );
    }

    async findDuplicate(
        jenis_wilayah,
        nama_wilayah,
        tahun_umk,
        excludeId = null
    ) {
        const where = {
            jenis_wilayah,
            nama_wilayah,
            tahun_umk,
        };

        if (excludeId) {
            where.id_umk = {
                [Op.ne]: excludeId,
            };
        }

        return await Umk.findOne({
            where,
        });
    }

    async create(
        data,
        created_by
    ) {
        return await Umk.create({
            ...data,
            created_by,
        });
    }

    async update(
        id_umk,
        data,
        updated_by
    ) {
        await Umk.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_umk,
                },
            }
        );

        return await this.findById(
            id_umk
        );
    }

    async delete(id_umk) {
        return await Umk.destroy({
            where: {
                id_umk,
            },
        });
    }
}

module.exports = new UmkRepository();