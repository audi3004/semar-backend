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

const getRelativeDirectory = (fieldname) => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return path.join(month, "signatures", signatureFolders[fieldname]);
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const directory = path.join(process.cwd(), "uploads", "ijin", getRelativeDirectory(file.fieldname));
        fs.mkdirSync(directory, { recursive: true });
        callback(null, directory);
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeBase = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 60) || file.fieldname;
        callback(null, `${safeBase}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
});

module.exports = multer({
    storage,
    fileFilter: (req, file, callback) => {
        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
            return callback(new Error("Signature harus berformat JPG, JPEG, atau PNG"), false);
        }
        callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024, files: 6 },
}).fields(Object.keys(signatureFolders).map((name) => ({ name, maxCount: 1 })));

module.exports.getRelativeDirectory = getRelativeDirectory;
