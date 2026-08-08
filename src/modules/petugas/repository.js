const {
    Op,
} = require(
    "sequelize"
);

const {
    Petugas,
    Unit,
    Jabatan,
    Project,
    Umk,
} = require(
    "../../models"
);

class PetugasRepository {
    getInclude() {
        return [
            {
                model: Unit,
                as: "unit",
                attributes: [
                    "id_unit",
                    "nama_unit",
                    "is_active",
                ],
                required: false,
            },

            {
                model: Jabatan,
                as: "jabatan",
                attributes: [
                    "id_jabatan",
                    "id_project",
                    "nama_jabatan",
                    "is_active",
                ],
                required: false,

                include: [
                    {
                        model: Project,
                        as: "project",
                        attributes: [
                            "id_project",
                            "nama_project",
                            "is_active",
                        ],
                        required: false,
                    },
                ],
            },

            {
                model: Umk,
                as: "umk",
                attributes: [
                    "id_umk",
                    "jenis_wilayah",
                    "nama_wilayah",
                    "tahun_umk",
                    "nominal_umk",
                    "is_active",
                ],
                required: false,
            },
        ];
    }

    async findAll(
        filters = {}
    ) {
        const where = {};

        if (filters.id_unit) {
            where.id_unit =
                filters.id_unit;
        }

        if (
            filters.id_jabatan
        ) {
            where.id_jabatan =
                filters.id_jabatan;
        }

        if (filters.id_umk) {
            where.id_umk =
                filters.id_umk;
        }

        if (filters.nip) {
            where.nip = {
                [Op.like]:
                    `%${filters.nip}%`,
            };
        }

        if (filters.nama) {
            where.nama = {
                [Op.like]:
                    `%${filters.nama}%`,
            };
        }

        if (filters.tgl_masuk) {
            where.tgl_masuk =
                filters.tgl_masuk;
        }

        if (
            filters.is_active
        ) {
            where.is_active =
                filters.is_active;
        }

        return await Petugas.findAll({
            where,

            include:
                this.getInclude(),

            order: [
                [
                    "nama",
                    "ASC",
                ],
            ],
        });
    }

    async findById(
        id_petugas
    ) {
        return await Petugas.findByPk(
            id_petugas,
            {
                include:
                    this.getInclude(),
            }
        );
    }

    async findByNip(
        nip,
        excludeId = null
    ) {
        const where = {
            nip,
        };

        if (excludeId) {
            where.id_petugas = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Petugas.findOne({
            where,
        });
    }

    async create(
        data,
        created_by = null
    ) {
        const result =
            await Petugas.create({
                ...data,
                created_by,
            });

        return await this.findById(
            result.id_petugas
        );
    }

    async update(
        id_petugas,
        data,
        updated_by = null
    ) {
        await Petugas.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_petugas,
                },
            }
        );

        return await this.findById(
            id_petugas
        );
    }

    async updateUnit(
        id_petugas,
        id_unit,
        updated_by = null,
        transaction = null
    ) {
        return await Petugas.update(
            {
                id_unit,
                updated_by,
            },
            {
                where: { id_petugas },
                transaction,
            }
        );
    }

    async delete(
        id_petugas
    ) {
        return await Petugas.destroy({
            where: {
                id_petugas,
            },
        });
    }
}

module.exports =
    new PetugasRepository();
