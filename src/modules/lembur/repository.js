const {
    Op,
} = require("sequelize");

const {
    Lembur,
    Petugas,
    Unit,
    Jabatan,
    Project,
    Umk,
    Status,
    Role,
    LogLembur,
    User,
    Pegawai,
    Cuti,
    Ijin,
    Sakit,
    HariLibur,
    Spkl,
    SpklPetugas,
} = require("../../models");
const resolveTransactionProject = require("../../utils/transactionProject");

class LemburRepository {
    async findHolidayByDate(tanggal) {
        return await HariLibur.findOne({
            where: { tanggal, is_active: "Y" },
        });
    }

    async findReplacementCandidates(tanggal) {
        const makeStatusInclude = () => ({
            model: Status,
            as: "status",
            attributes: ["id_status", "kode_status", "nama_status"],
            required: true,
            where: {
                kode_status: {
                    [Op.notIn]: ["DRAFT", "REVISION", "REJECTED"],
                },
            },
        });
        const makePetugasInclude = () => ({
            model: Petugas,
            as: "petugas",
            attributes: ["id_petugas", "id_unit", "nip", "nama"],
            required: true,
            include: [{
                model: Unit,
                as: "unit",
                attributes: ["id_unit", "nama_unit"],
                required: false,
            }],
        });

        const [cuti, ijin, sakit] = await Promise.all([
            Cuti.findAll({
                where: {
                    tgl_mulai: { [Op.lte]: tanggal },
                    tgl_selesai: { [Op.gte]: tanggal },
                },
                include: [makeStatusInclude(), makePetugasInclude()],
            }),
            Ijin.findAll({
                where: {
                    tanggal: { [Op.lte]: tanggal },
                    tgl_selesai: { [Op.gte]: tanggal },
                },
                include: [makeStatusInclude(), makePetugasInclude()],
            }),
            Sakit.findAll({
                where: {
                    tanggal: { [Op.lte]: tanggal },
                    tgl_selesai: { [Op.gte]: tanggal },
                },
                include: [makeStatusInclude(), makePetugasInclude()],
            }),
        ]);

        const candidates = new Map();
        const collect = (rows, type, startField) => rows.forEach((row) => {
            const plain = row.get({ plain: true });
            const key = String(plain.id_petugas);
            const current = candidates.get(key) || {
                ...plain.petugas,
                alasan_ketidakhadiran: [],
            };
            current.alasan_ketidakhadiran.push({
                jenis: type,
                tanggal_mulai: plain[startField],
                tanggal_selesai: plain.tgl_selesai,
                status: plain.status?.nama_status,
            });
            candidates.set(key, current);
        });

        collect(cuti, "CUTI", "tgl_mulai");
        collect(ijin, "IJIN", "tanggal");
        collect(sakit, "SAKIT", "tanggal");
        return [...candidates.values()].sort((a, b) =>
            String(a.nama).localeCompare(String(b.nama), "id")
        );
    }

    async findAvailableBases(idPetugas, tanggal = null) {
        const petugas = await Petugas.findByPk(idPetugas, { attributes: ["id_petugas", "id_unit"] });
        if (!petugas) return [];
        const spklRows = await SpklPetugas.findAll({
            where: { id_petugas: idPetugas, status_penugasan: { [Op.in]: ["ASSIGNED", "DRAFTED"] } },
            include: [{ model: Spkl, as: "spkl", required: true, where: { status_spkl: "ACTIVE", ...(tanggal ? { tgl_lembur: tanggal } : {}) } }, { model: Lembur, as: "lembur", required: false }],
        });
        const status = { model: Status, as: "status", required: true, where: { kode_status: { [Op.notIn]: ["DRAFT", "REVISION", "REJECTED", "CANCELLED"] } }, attributes: ["kode_status", "nama_status"] };
        const owner = { model: Petugas, as: "petugas", required: true, where: { id_unit: petugas.id_unit, id_petugas: { [Op.ne]: idPetugas } }, attributes: ["id_petugas", "nip", "nama", "id_unit"] };
        const unused = (alias) => ({ model: Lembur, as: alias, required: false, attributes: ["id_lembur"] });
        const dateWhere = (start) => tanggal ? { [start]: { [Op.lte]: tanggal }, tgl_selesai: { [Op.gte]: tanggal } } : {};
        const [cuti, ijin, sakit] = await Promise.all([
            Cuti.findAll({ where: dateWhere("tgl_mulai"), include: [status, owner, unused("lemburPengganti")] }),
            Ijin.findAll({ where: dateWhere("tanggal"), include: [status, owner, unused("lemburPengganti")] }),
            Sakit.findAll({ where: dateWhere("tanggal"), include: [status, owner, unused("lemburPengganti")] }),
        ]);
        const spkl = spklRows.filter((row) => !row.lembur).map((row) => ({ type: "SPKL", reference_id: row.id_spkl_petugas, tanggal: row.spkl.tgl_lembur, nomor_dokumen: row.spkl.nomor_dokumen, kategori_lembur: row.spkl.kategori_lembur, jenis_pekerjaan: row.spkl.jenis_pekerjaan, kode_jenis_pekerjaan: row.spkl.kode_jenis_pekerjaan, area_group: row.spkl.area_group, detail_pekerjaan: row.spkl.detail_pekerjaan }));
        const mapAbsence = (rows, type, idField, start) => rows.filter((row) => !(row.lemburPengganti || []).length).map((row) => ({ type, reference_id: row[idField], tanggal: tanggal || row[start], tanggal_mulai: row[start], tanggal_selesai: row.tgl_selesai, nomor_dokumen: row.nomor_dokumen, petugas: row.petugas, kategori_lembur: "005 - Piket Tanggal Merah / Cuti Pengganti", jenis_pekerjaan: `Pengganti ${type}` }));
        return [...spkl, ...mapAbsence(cuti, "CUTI", "id_cuti", "tgl_mulai"), ...mapAbsence(ijin, "IJIN", "id_ijin", "tanggal"), ...mapAbsence(sakit, "SAKIT", "id_sakit", "tanggal")];
    }

    getStatusInclude() {
        return {
            model: Status,
            as: "status",
            required: true,

            attributes: [
                "id_status",
                "id_role",
                "kode_status",
                "nama_status",
                "urutan_status",
                "id_status_next",
                "id_status_revision",
                "id_status_rejected",
                "is_initial",
                "is_final",
                "is_active",
            ],

            include: [
                {
                    model: Role,
                    as: "role",
                    required: false,

                    attributes: [
                        "id_role",
                        "kode_role",
                        "nama_role",
                        "level_role",
                        "is_super_admin",
                        "is_active",
                    ],
                },

                {
                    model: Status,
                    as: "nextStatus",
                    required: false,

                    attributes: [
                        "id_status",
                        "id_role",
                        "kode_status",
                        "nama_status",
                    ],

                    include: [
                        {
                            model: Role,
                            as: "role",
                            required: false,

                            attributes: [
                                "id_role",
                                "kode_role",
                                "nama_role",
                            ],
                        },
                    ],
                },

                {
                    model: Status,
                    as: "revisionStatus",
                    required: false,

                    attributes: [
                        "id_status",
                        "id_role",
                        "kode_status",
                        "nama_status",
                    ],

                    include: [
                        {
                            model: Role,
                            as: "role",
                            required: false,

                            attributes: [
                                "id_role",
                                "kode_role",
                                "nama_role",
                            ],
                        },
                    ],
                },

                {
                    model: Status,
                    as: "rejectedStatus",
                    required: false,

                    attributes: [
                        "id_status",
                        "id_role",
                        "kode_status",
                        "nama_status",
                    ],
                },
            ],
        };
    }

    getPetugasInclude() {
        return {
            model: Petugas,
            as: "petugas",
            required: true,

            include: [
                {
                    model: Unit,
                    as: "unit",
                    required: false,
                    include: [{
                        model: Unit,
                        as: "indukUnit",
                        required: false,
                        include: [{ model: Unit, as: "indukUnit", required: false }],
                    }],
                },

                {
                    model: Jabatan,
                    as: "jabatan",
                    required: false,
                },
                { model: Project, as: "project", required: false },

                {
                    model: Umk,
                    as: "umk",
                    required: false,
                },
            ],
        };
    }

    getInclude() {
        return [
            this.getPetugasInclude(),
            {
                model: Petugas,
                as: "petugasCuti",
                required: false,
            },
            { model: SpklPetugas, as: "spklAssignment", required: false, include: [{ model: Spkl, as: "spkl", required: false }] },
            { model: Cuti, as: "dasarCuti", required: false }, { model: Ijin, as: "dasarIjin", required: false }, { model: Sakit, as: "dasarSakit", required: false },
            this.getStatusInclude(),
            {
                model: LogLembur,
                as: "logs",
                required: false,
                attributes: ["id_log_lembur", "id_status_sebelum", "id_status_sesudah", "aksi", "keterangan", "created_at", "created_by"],
                include: [{ model: User, as: "createdBy", required: false, attributes: ["id_user", "id_role", "id_pegawai", "id_petugas", "username"], include: [
                    { model: Role, as: "role", required: false, attributes: ["kode_role", "nama_role"] },
                    { model: Pegawai, as: "pegawai", required: false, attributes: ["nama", "nip"] },
                    { model: Petugas, as: "petugas", required: false, attributes: ["nama", "nip"] },
                ] }],
            },
        ];
    }

    async findAll(
        filters = {}
    ) {
        const where = {};

        if (filters.id_petugas) {
            where.id_petugas =
                filters.id_petugas;
        }

        if (filters.id_petugas_cuti) {
            where.id_petugas_cuti =
                filters.id_petugas_cuti;
        }

        if (filters.id_status) {
            where.id_status =
                filters.id_status;
        }

        if (filters.tgl_lembur) {
            where.tgl_lembur =
                filters.tgl_lembur;
        }

        if (filters.kategori_lembur) {
            where.kategori_lembur = {
                [Op.like]:
                    `%${filters.kategori_lembur}%`,
            };
        }
        if (filters.id_spkl_petugas) where.id_spkl_petugas = filters.id_spkl_petugas;

        if (
            filters.tgl_awal &&
            filters.tgl_akhir
        ) {
            where.tgl_lembur = {
                [Op.between]: [
                    filters.tgl_awal,
                    filters.tgl_akhir,
                ],
            };
        }

        const statusInclude =
            this.getStatusInclude();

        if (filters.id_role) {
            statusInclude.where = {
                id_role:
                    filters.id_role,
            };
        }

        if (filters.kode_status) {
            statusInclude.where = {
                ...(statusInclude.where ||
                    {}),

                kode_status:
                    filters.kode_status,
            };
        }

        if (filters.is_final) {
            statusInclude.where = {
                ...(statusInclude.where ||
                    {}),

                is_final:
                    filters.is_final,
            };
        }

        return await Lembur.findAll({
            where,

            include: [
                this.getPetugasInclude(),
                statusInclude,
            ],

            order: [
                [
                    "tgl_lembur",
                    "DESC",
                ],

                [
                    "jam_mulai",
                    "DESC",
                ],

                [
                    "id_lembur",
                    "DESC",
                ],
            ],
        });
    }

    async findById(
        id_lembur,
        transaction = null
    ) {
        return await Lembur.findByPk(
            id_lembur,
            {
                include:
                    this.getInclude(),
                transaction,
            }
        );
    }

    async findRawById(
        id_lembur
    ) {
        return await Lembur.findByPk(
            id_lembur
        );
    }

    async findPending(scope = null) {
        if (scope && scope.unitIds.length === 0) {
            return [];
        }

        const statusInclude =
            this.getStatusInclude();
        const petugasInclude =
            this.getPetugasInclude();
        const logInclude = this.getInclude().find((include) => include.as === "logs");

        statusInclude.where = {
            is_final: "N",
            is_active: "Y",
            ...(scope
                ? { id_role: scope.idRole }
                : {}),
        };

        if (scope) {
            petugasInclude.where = {
                id_unit: {
                    [Op.in]: scope.unitIds,
                },
            };
        }

        return await Lembur.findAll({
            where: scope ? { id_project: { [Op.in]: scope.projectIds || [] } } : undefined,
            include: [
                petugasInclude,
                statusInclude,
                logInclude,
            ],

            order: [
                [
                    "tgl_lembur",
                    "ASC",
                ],

                [
                    "jam_mulai",
                    "ASC",
                ],
            ],
        });
    }

    async findByPetugas(
        id_petugas
    ) {
        return await Lembur.findAll({
            where: {
                id_petugas,
            },

            include:
                this.getInclude(),

            order: [
                [
                    "tgl_lembur",
                    "DESC",
                ],

                [
                    "jam_mulai",
                    "DESC",
                ],

                [
                    "id_lembur",
                    "DESC",
                ],
            ],
        });
    }

    async findOverlapping(
        id_petugas,
        tgl_lembur,
        jam_mulai,
        jam_selesai,
        excludeId = null
    ) {
        const statusInclude =
            this.getStatusInclude();

        statusInclude.where = {
            kode_status: {
                [Op.notIn]: [
                    "REJECTED",
                    "CANCELLED",
                ],
            },
        };

        const where = {
            id_petugas,
            tgl_lembur,

            jam_mulai: {
                [Op.lt]:
                    jam_selesai,
            },

            jam_selesai: {
                [Op.gt]:
                    jam_mulai,
            },
        };

        if (excludeId) {
            where.id_lembur = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Lembur.findOne({
            where,

            include: [
                statusInclude,
            ],
        });
    }

    async create(
        data,
        created_by = null,
        transaction = null
    ) {
        data.id_project = await resolveTransactionProject(data, transaction);
        const result =
            await Lembur.create(
                {
                    ...data,
                    created_by,
                },
                {
                    transaction,
                }
            );

        return await this.findById(
            result.id_lembur,
            transaction
        );
    }

    async update(
        id_lembur,
        data,
        updated_by = null,
        transaction = null
    ) {
        await Lembur.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_lembur,
                },
                transaction,
            }
        );

        return await this.findById(
            id_lembur,
            transaction
        );
    }

    async updateStatus(
        id_lembur,
        id_status,
        updated_by = null,
        transaction = null
    ) {
        await Lembur.update(
            {
                id_status,
                updated_by,
            },
            {
                where: {
                    id_lembur,
                },
                transaction,
            }
        );

        return await this.findById(
            id_lembur,
            transaction
        );
    }

    async delete(
        id_lembur,
        transaction = null
    ) {
        return await Lembur.destroy({
            where: {
                id_lembur,
            },
            transaction,
        });
    }
}

module.exports =
    new LemburRepository();
