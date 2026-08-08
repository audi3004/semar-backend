const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    "surat-dokter"
);

/*
 * Membuat folder otomatis jika belum tersedia.
 */
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (
        req,
        file,
        callback
    ) => {
        callback(null, uploadDirectory);
    },

    filename: (
        req,
        file,
        callback
    ) => {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const randomName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}`;

        callback(
            null,
            `surat-dokter-${randomName}${extension}`
        );
    },
});

const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
];

const fileFilter = (
    req,
    file,
    callback
) => {
    if (
        !allowedMimeTypes.includes(
            file.mimetype
        )
    ) {
        return callback(
            new Error(
                "Surat dokter harus berformat PDF, JPG, JPEG, atau PNG"
            ),
            false
        );
    }

    callback(null, true);
};

const uploadSuratDokter = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = uploadSuratDokter;