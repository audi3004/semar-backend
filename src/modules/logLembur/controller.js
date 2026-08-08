const logLemburService =
    require("./service");

const response = require(
    "../../utils/response"
);

class LogLemburController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await logLemburService
                    .findAll(
                        req.query
                    );
            return response.success(
                res,
                data,
                "Data log lembur berhasil diambil"
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
                await logLemburService
                    .findById(
                        req.params.id
                    );
            return response.success(
                res,
                data,
                "Detail log lembur berhasil diambil"
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

    async findByLembur(
        req,
        res
    ) {
        try {
            const data =
                await logLemburService
                    .findByLembur(
                        req.params.id
                    );
            return response.success(
                res,
                data,
                "Riwayat transaksi lembur berhasil diambil"
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
    new LogLemburController();
