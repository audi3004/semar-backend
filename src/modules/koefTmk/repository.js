const { Op } = require("sequelize");

const {
    KoefTmk,
} = require("../../models");

class KoefTmkRepository {
    async findAll(filters = {}) {
        const where = {};

        if (
            filters.masa_kerja !== undefined &&
            filters.masa_kerja !== null &&
            filters.masa_kerja !== ""
        ) {
            where.masa_kerja = filters.masa_kerja;
        }

        if (
            filters.koef !== undefined &&
            filters.koef !== null &&
            filters.koef !== ""
        ) {
            where.koef = filters.koef;
        }

        if (
            filters.tmk !== undefined &&
            filters.tmk !== null &&
            filters.tmk !== ""
        ) {
            where.tmk = filters.tmk;
        }

        if (filters.keterangan) {
            where.keterangan = {
                [Op.like]:
                    `%${filters.keterangan}%`,
            };
        }

        if (filters.is_active) {
            where.is_active =
                filters.is_active;
        }

        return await KoefTmk.findAll({
            where,

            order: [
                [
                    "masa_kerja",
                    "ASC",
                ],
            ],
        });
    }

    async findById(id_koef_tmk) {
        return await KoefTmk.findByPk(
            id_koef_tmk
        );
    }

    async findByMasaKerja(
        masa_kerja,
        excludeId = null
    ) {
        const where = {
            masa_kerja,
        };

        if (excludeId) {
            where.id_koef_tmk = {
                [Op.ne]: excludeId,
            };
        }

        return await KoefTmk.findOne({
            where,
        });
    }

    async create(
        data,
        created_by = null
    ) {
        return await KoefTmk.create({
            ...data,
            created_by,
        });
    }

    async update(
        id_koef_tmk,
        data,
        updated_by = null
    ) {
        await KoefTmk.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_koef_tmk,
                },
            }
        );

        return await this.findById(
            id_koef_tmk
        );
    }

    async delete(id_koef_tmk) {
        return await KoefTmk.destroy({
            where: {
                id_koef_tmk,
            },
        });
    }
}

module.exports =
    new KoefTmkRepository();
