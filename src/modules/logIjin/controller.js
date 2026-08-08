const logIjinService =
    require("./service");

const response = require(
    "../../utils/response"
);

class LogIjinController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await logIjinService
                    .findAll(
                        req.query
                    );
            return response.success(
                res,
                data,
                "Data log ijin berhasil diambil"
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
                await logIjinService
                    .findById(
                        req.params.id
                    );
            return response.success(
                res,
                data,
                "Detail log ijin berhasil diambil"
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

    async findByIjin(
        req,
        res
    ) {
        try {
            const data =
                await logIjinService
                    .findByIjin(
                        req.params.id
                    );
            return response.success(
                res,
                data,
                "Riwayat transaksi ijin berhasil diambil"
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
    new LogIjinController();
