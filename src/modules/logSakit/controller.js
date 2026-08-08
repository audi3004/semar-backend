const logSakitService =
    require("./service");

const response = require(
    "../../utils/response"
);

class LogSakitController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await logSakitService
                    .findAll(
                        req.query
                    );
            return response.success(
                res,
                data,
                "Data log sakit berhasil diambil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }

    async findById(
        req,
        res
    ) {
        try {
            const data =
                await logSakitService
                    .findById(
                        req.params.id
                    );
            return response.success(
                res,
                data,
                "Detail log sakit berhasil diambil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }

    async findBySakit(
        req,
        res
    ) {
        try {
            const data =
                await logSakitService
                    .findBySakit(
                        req.params.id
                    );
            return response.success(
                res,
                data,
                "Riwayat transaksi sakit berhasil diambil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }
}

module.exports =
    new LogSakitController();
