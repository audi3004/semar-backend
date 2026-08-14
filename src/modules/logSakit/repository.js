const {
    Op,
} = require("sequelize");

const {
    LogSakit,
    Sakit,
    Status,
    User,
    Role,
    Pegawai,
    Petugas,
} = require("../../models");

class LogSakitRepository {
    getInclude() {
        return [
            {
                model: Sakit,
                as: "sakit",
                required: false,
            },
            {
                model: Status,
                as: "statusSebelum",
                required: false,
            },
            {
                model: Status,
                as: "statusSesudah",
                required: false,
            },
            {
                model: User,
                as: "createdBy",
                required: false,
                attributes: ["id_user", "id_role", "id_pegawai", "id_petugas", "username", "email"],
                include: [
                    { model: Role, as: "role", required: false, attributes: ["kode_role", "nama_role"] },
                    { model: Pegawai, as: "pegawai", required: false, attributes: ["nama", "nip"] },
                    { model: Petugas, as: "petugas", required: false, attributes: ["nama", "nip"] },
                ],
            },
        ];
    }

    async findAll(
        filters = {}
    ) {
        const where = {};

        for (
            const field of [
                "id_sakit",
                "aksi",
                "id_status_sebelum",
                "id_status_sesudah",
                "created_by",
            ]
        ) {
            if (filters[field]) {
                where[field] =
                    filters[field];
            }
        }

        if (
            filters.tgl_awal &&
            filters.tgl_akhir
        ) {
            where.created_at = {
                [Op.between]: [
                    `${filters.tgl_awal} 00:00:00`,
                    `${filters.tgl_akhir} 23:59:59`,
                ],
            };
        }

        return await LogSakit
            .findAll({
                where,
                include:
                    this.getInclude(),
                order: [
                    [
                        "created_at",
                        "DESC",
                    ],
                    [
                        "id_log_sakit",
                        "DESC",
                    ],
                ],
            });
    }

    async findById(
        id_log_sakit
    ) {
        return await LogSakit.findByPk(
            id_log_sakit,
            {
                include:
                    this.getInclude(),
            }
        );
    }

    async findBySakit(
        id_sakit
    ) {
        return await LogSakit.findAll({
            where: {
                id_sakit,
            },
            include:
                this.getInclude(),
            order: [
                [
                    "created_at",
                    "ASC",
                ],
                [
                    "id_log_sakit",
                    "ASC",
                ],
            ],
        });
    }

    async create(
        data,
        transaction = null
    ) {
        return await LogSakit.create(
            data,
            {
                transaction,
            }
        );
    }
}

module.exports =
    new LogSakitRepository();
