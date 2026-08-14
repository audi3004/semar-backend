const {
    Op,
} = require("sequelize");

const {
    LogCuti,
    Cuti,
    Status,
    User,
    Role,
    Pegawai,
    Petugas,
} = require("../../models");

class LogCutiRepository {
    getInclude() {
        return [
            {
                model: Cuti,
                as: "cuti",
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

        if (filters.id_cuti) {
            where.id_cuti =
                filters.id_cuti;
        }

        if (filters.aksi) {
            where.aksi =
                filters.aksi;
        }

        if (
            filters
                .id_status_sebelum
        ) {
            where.id_status_sebelum =
                filters
                    .id_status_sebelum;
        }

        if (
            filters
                .id_status_sesudah
        ) {
            where.id_status_sesudah =
                filters
                    .id_status_sesudah;
        }

        if (filters.created_by) {
            where.created_by =
                filters.created_by;
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

        return await LogCuti
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
                        "id_log_cuti",
                        "DESC",
                    ],
                ],
            });
    }

    async findById(
        id_log_cuti
    ) {
        return await LogCuti
            .findByPk(
                id_log_cuti,
                {
                    include:
                        this
                            .getInclude(),
                }
            );
    }

    async findByCuti(
        id_cuti
    ) {
        return await LogCuti
            .findAll({
                where: {
                    id_cuti,
                },
                include:
                    this.getInclude(),
                order: [
                    [
                        "created_at",
                        "ASC",
                    ],
                    [
                        "id_log_cuti",
                        "ASC",
                    ],
                ],
            });
    }

    async create(
        data,
        transaction = null
    ) {
        return await LogCuti
            .create(
                data,
                {
                    transaction,
                }
            );
    }
}

module.exports =
    new LogCutiRepository();
