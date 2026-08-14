const {
    Op,
} = require("sequelize");

const {
    LogLembur,
    Lembur,
    Status,
    User,
    Role,
    Pegawai,
    Petugas,
} = require("../../models");

class LogLemburRepository {
    getInclude() {
        return [
            {
                model: Lembur,
                as: "lembur",
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
                "id_lembur",
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

        return await LogLembur
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
                        "id_log_lembur",
                        "DESC",
                    ],
                ],
            });
    }

    async findById(
        id_log_lembur
    ) {
        return await LogLembur
            .findByPk(
                id_log_lembur,
                {
                    include:
                        this
                            .getInclude(),
                }
            );
    }

    async findByLembur(
        id_lembur
    ) {
        return await LogLembur
            .findAll({
                where: {
                    id_lembur,
                },
                include:
                    this.getInclude(),
                order: [
                    [
                        "created_at",
                        "ASC",
                    ],
                    [
                        "id_log_lembur",
                        "ASC",
                    ],
                ],
            });
    }

    async create(
        data,
        transaction = null
    ) {
        return await LogLembur
            .create(
                data,
                {
                    transaction,
                }
            );
    }
}

module.exports =
    new LogLemburRepository();
