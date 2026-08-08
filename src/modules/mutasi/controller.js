const mutasiService = require(
    "./service"
);
const response = require(
    "../../utils/response"
);

class MutasiController {
    async findAll(req, res) {
        try {
            const mutasi =
                await mutasiService.findAll();

            return response.success(
                res,
                mutasi,
                "Data mutasi berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findById(req, res) {
        try {
            const mutasi =
                await mutasiService.findById(
                    req.params.id
                );

            return response.success(
                res,
                mutasi,
                "Detail mutasi berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findByPegawai(req, res) {
        try {
            const mutasi =
                await mutasiService
                    .findByPegawai(
                        req.params.id
                    );

            return response.success(
                res,
                mutasi,
                "Riwayat mutasi pegawai berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findByUnit(req, res) {
        try {
            const mutasi =
                await mutasiService.findByUnit(
                    req.params.id
                );

            return response.success(
                res,
                mutasi,
                "Data mutasi berdasarkan unit berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findByPetugas(req, res) {
        try {
            const mutasi =
                await mutasiService.findByPetugas(
                    req.params.id
                );

            return response.success(
                res,
                mutasi,
                "Riwayat mutasi petugas berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async create(req, res) {
        try {
            const mutasi =
                await mutasiService.create(
                    req.body,
                    req.user?.id_user || null
                );

            return response.created(
                res,
                mutasi,
                "Mutasi pegawai berhasil ditambahkan"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

}

module.exports =
    new MutasiController();
