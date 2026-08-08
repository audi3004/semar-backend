const logCutiService =
    require("./service");

const response = require(
    "../../utils/response"
);

class LogCutiController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await logCutiService
                    .findAll(
                        req.query
                    );

            return response.success(
                res,
                data,
                "Data log cuti berhasil diambil"
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
                await logCutiService
                    .findById(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Detail log cuti berhasil diambil"
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

    async findByCuti(
        req,
        res
    ) {
        try {
            const data =
                await logCutiService
                    .findByCuti(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Riwayat transaksi cuti berhasil diambil"
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
    new LogCutiController();
