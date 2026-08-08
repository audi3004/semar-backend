const response = require(
    "../utils/response"
);

const requireFileOrBody = (
    req,
    res,
    next
) => {
    const hasBody =
        req.body &&
        Object.keys(req.body).length > 0;

    const hasFile = Boolean(req.file);

    if (!hasBody && !hasFile) {
        return response.validation(
            res,
            [
                {
                    field: "body",
                    message:
                        "Minimal satu data atau surat dokter harus dikirim",
                },
            ],
            "Validasi data gagal"
        );
    }

    next();
};

module.exports = requireFileOrBody;