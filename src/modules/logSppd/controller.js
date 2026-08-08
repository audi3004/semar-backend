const logSppdService =
    require("./service");

const response = require(
    "../../utils/response"
);

class LogSppdController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await logSppdService
                    .findAll(
                        req.query
                    );
            return response.success(
                res,
                data,
                "Data log SPPD berhasil diambil"
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
                await logSppdService
                    .findById(
                        req.params.id
                    );
            return response.success(
                res,
                data,
                "Detail log SPPD berhasil diambil"
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

    async findBySppd(
        req,
        res
    ) {
        try {
            const data =
                await logSppdService
                    .findBySppd(
                        req.params.id
                    );
            return response.success(
                res,
                data,
                "Riwayat transaksi SPPD berhasil diambil"
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
    new LogSppdController();
