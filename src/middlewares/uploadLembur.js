const fs = require("fs");
const path = require("path");
const multer = require("multer");

const signatureFolders = {
    maker_signature: "maker",
    checker_signature: "checker",
    verification_signature: "verification",
    approval_1_signature: "approval-1",
    approval_2_signature: "approval-2",
    approval_3_signature: "approval-3",
};

const getMonthFolder = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getRelativeDirectory = (fieldname) => {
    const month = getMonthFolder();
    return signatureFolders[fieldname]
        ? path.join(month, "signatures", signatureFolders[fieldname])
        : path.join(month, fieldname);
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const directory = path.join(process.cwd(), "uploads", "lembur", getRelativeDirectory(file.fieldname));
        fs.mkdirSync(directory, { recursive: true });
        callback(null, directory);
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeBase = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 60) || file.fieldname;
        callback(null, `${safeBase}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
});

const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
const documentMimeTypes = [...imageMimeTypes, "application/pdf"];

const fileFilter = (req, file, callback) => {
    const allowed = file.fieldname === "surat_perintah_lembur" ? documentMimeTypes : imageMimeTypes;
    if (!allowed.includes(file.mimetype)) {
        return callback(new Error(file.fieldname === "surat_perintah_lembur"
            ? "Surat perintah lembur harus berformat PDF, JPG, JPEG, atau PNG"
            : "Foto dan signature harus berformat JPG, JPEG, atau PNG"), false);
    }
    callback(null, true);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1 * 1024 * 1024, files: 9 },
}).fields([
    { name: "foto_kegiatan_1", maxCount: 1 },
    { name: "foto_kegiatan_2", maxCount: 1 },
    { name: "surat_perintah_lembur", maxCount: 1 },
    ...Object.keys(signatureFolders).map((name) => ({ name, maxCount: 1 })),
]);

module.exports.getRelativeDirectory = getRelativeDirectory;
