const fs = require("fs");
const path = require("path");
const multer = require("multer");

const getRelativeDirectory = () => {
    const now = new Date();
    return path.join(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
        "signatures",
        "bulk-approval"
    );
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const directory = path.join(process.cwd(), "uploads", "workflow", getRelativeDirectory());
        fs.mkdirSync(directory, { recursive: true });
        callback(null, directory);
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `bulk-approval-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
});

module.exports = multer({
    storage,
    fileFilter: (req, file, callback) => {
        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
            return callback(new Error("Tanda tangan harus berformat JPG, JPEG, atau PNG"), false);
        }
        callback(null, true);
    },
    limits: { fileSize: 1 * 1024 * 1024, files: 1 },
}).fields([
    { name: "approval_1_signature", maxCount: 1 },
    { name: "approval_2_signature", maxCount: 1 },
    { name: "approval_3_signature", maxCount: 1 },
]);

module.exports.getRelativeDirectory = getRelativeDirectory;
