const path = require("path");
const { getRelativeDirectory } = require("./uploadSppd");

const fields = [
    "maker_signature",
    "checker_signature",
    "verification_signature",
    "approval_1_signature",
    "approval_2_signature",
    "approval_3_signature",
];

module.exports = (req, res, next) => {
    for (const field of fields) {
        const file = req.files?.[field]?.[0];
        if (file) {
            const relative = path.join(getRelativeDirectory(field), file.filename).replace(/\\/g, "/");
            req.body[field] = `/uploads/sppd/${relative}`;
        }
    }
    next();
};
