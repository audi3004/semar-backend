const {
    Op,
} = require("sequelize");

const {
    LogIjin,
    Ijin,
    Status,
    User,
    Role,
    Pegawai,
    Petugas,
} = require("../../models");

class LogIjinRepository {
    getInclude() {
        return [
            {
                model: Ijin,
                as: "ijin",
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
                    { model: Pegawai, as: "pegawai", required: false, attributes: ["nama"] },
                    { model: Petugas, as: "petugas", required: false, attributes: ["nama"] },
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
                "id_ijin",
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

        return await LogIjin.findAll({
            where,
            include:
                this.getInclude(),
            order: [
                [
                    "created_at",
                    "DESC",
                ],
                [
                    "id_log_ijin",
                    "DESC",
                ],
            ],
        });
    }

    async findById(
        id_log_ijin
    ) {
        return await LogIjin.findByPk(
            id_log_ijin,
            {
                include:
                    this.getInclude(),
            }
        );
    }

    async findByIjin(
        id_ijin
    ) {
        return await LogIjin.findAll({
            where: {
                id_ijin,
            },
            include:
                this.getInclude(),
            order: [
                [
                    "created_at",
                    "ASC",
                ],
                [
                    "id_log_ijin",
                    "ASC",
                ],
            ],
        });
    }

    async create(
        data,
        transaction = null
    ) {
        return await LogIjin.create(
            data,
            {
                transaction,
            }
        );
    }
}

module.exports =
    new LogIjinRepository();
