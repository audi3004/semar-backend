const { Op } = require(
    "sequelize"
);

const {
    Gaji,
    Umk,
    KoefTmk,
} = require("../../models");

class GajiRepository {
    getInclude() {
        const include = [
            {
                model: Umk,
                as: "umk",
                attributes: [
                    "id_umk",
                    "jenis_wilayah",
                    "nama_wilayah",
                    "tahun_umk",
                    "nominal_umk",
                ],
            },

            {
                model: KoefTmk,
                as: "koefTmk",
                attributes: [
                    "id_koef_tmk",
                    "masa_kerja",
                    "koef",
                    "tmk",
                ],
            },
        ];

        return include;
    }

    async findAll(filters = {}) {
        const where = {};

        if (filters.id_umk) {
            where.id_umk =
                filters.id_umk;
        }

        if (filters.id_koef_tmk) {
            where.id_koef_tmk =
                filters.id_koef_tmk;
        }

        if (filters.is_active) {
            where.is_active =
                filters.is_active;
        }

        return await Gaji.findAll({
            where,

            include:
                this.getInclude(),

            order: [
                ["id_gaji", "ASC"],
            ],
        });
    }

    async findById(id_gaji) {
        return await Gaji.findByPk(
            id_gaji,
            {
                include:
                    this.getInclude(),
            }
        );
    }

    async findDuplicate(
        id_umk,
        id_koef_tmk,
        excludeId = null
    ) {
        const where = {
            id_umk,
            id_koef_tmk,
        };

        if (excludeId) {
            where.id_gaji = {
                [Op.ne]: excludeId,
            };
        }

        return await Gaji.findOne({
            where,
        });
    }

    async create(
        data,
        created_by = null
    ) {
        const result =
            await Gaji.create({
                ...data,
                created_by,
            });

        return await this.findById(
            result.id_gaji
        );
    }

    async update(
        id_gaji,
        data,
        updated_by = null
    ) {
        await Gaji.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_gaji,
                },
            }
        );

        return await this.findById(
            id_gaji
        );
    }

    async delete(id_gaji) {
        return await Gaji.destroy({
            where: {
                id_gaji,
            },
        });
    }
}

module.exports =
    new GajiRepository();
