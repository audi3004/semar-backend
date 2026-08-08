const path = require("path");
const { getRelativeDirectory } = require("./uploadCuti");

const signatureFields = ["maker_signature", "checker_signature", "verification_signature", "approval_1_signature", "approval_2_signature", "approval_3_signature"];

module.exports = (req, res, next) => {
    for (const field of signatureFields) {
        const file = req.files?.[field]?.[0];
        if (file) {
            const relative = path.join(getRelativeDirectory(field), file.filename).replace(/\\/g, "/");
            req.body[field] = `/uploads/cuti/${relative}`;
        }
    }
    next();
};

module.exports.signatureFields = signatureFields;
