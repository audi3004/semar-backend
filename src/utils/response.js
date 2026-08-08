class Response {

    success(res, data = null, message = "Success", status = 200) {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    }

    created(res, data = null, message = "Data berhasil ditambahkan") {
        return res.status(201).json({
            success: true,
            message,
            data
        });
    }

    updated(res, data = null, message = "Data berhasil diperbarui") {
        return res.status(200).json({
            success: true,
            message,
            data
        });
    }

    deleted(res, message = "Data berhasil dihapus") {
        return res.status(200).json({
            success: true,
            message
        });
    }

    error(res, message = "Internal Server Error", status = 500) {
        return res.status(status).json({
            success: false,
            message
        });
    }

    validation(res, errors, message = "Validation Error") {
        return res.status(422).json({
            success: false,
            message,
            errors
        });
    }

    unauthorized(res, message = "Unauthorized") {
        return res.status(401).json({
            success: false,
            message
        });
    }

    forbidden(res, message = "Forbidden") {
        return res.status(403).json({
            success: false,
            message
        });
    }

    notFound(res, message = "Data tidak ditemukan") {
        return res.status(404).json({
            success: false,
            message
        });
    }

    pagination(
        res,
        data,
        page,
        limit,
        total,
        message = "Success"
    ) {

        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                page,
                limit,
                total,
                total_page: Math.ceil(total / limit)
            }
        });

    }

}

module.exports = new Response();