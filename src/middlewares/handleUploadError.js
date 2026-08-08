const multer = require("multer");
const response = require(
    "../utils/response"
);

const handleUploadError = (
    uploadMiddleware
) => {
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (!err) {
                return next();
            }

            if (
                err instanceof
                multer.MulterError
            ) {
                if (
                    err.code ===
                    "LIMIT_FILE_SIZE"
                ) {
                    return response.error(
                        res,
                        "Ukuran setiap file maksimal 5 MB",
                        400
                    );
                }

                return response.error(
                    res,
                    err.message,
                    400
                );
            }

            return response.error(
                res,
                err.message ||
                "Gagal mengunggah file",
                400
            );
        });
    };
};

module.exports = handleUploadError;
