const path = require("path");
const response = require("../utils/response");
const { getRelativeDirectory } = require("./uploadLembur");

const evidenceFields = ["foto_kegiatan_1", "foto_kegiatan_2", "surat_perintah_lembur"];
const signatureFields = ["maker_signature", "checker_signature", "verification_signature", "approval_1_signature", "approval_2_signature", "approval_3_signature"];

module.exports = (requiredEvidence = false) => (req, res, next) => {
    const missing = requiredEvidence.filter
        ? requiredEvidence.filter((field) => !req.files?.[field]?.[0])
        : requiredEvidence
            ? evidenceFields.filter((field) => !req.files?.[field]?.[0])
            : [];

    if (missing.length) {
        return response.validation(res, missing.map((field) => ({
            field,
            message: `${field.replace(/_/g, " ")} wajib diunggah`,
        })), "Validasi file gagal");
    }

    for (const field of [...evidenceFields, ...signatureFields]) {
        const file = req.files?.[field]?.[0];
        if (file) {
            const relative = path.join(getRelativeDirectory(field), file.filename).replace(/\\/g, "/");
            req.body[field] = `/uploads/lembur/${relative}`;
        }
    }
    next();
};

module.exports.evidenceFields = evidenceFields;
module.exports.signatureFields = signatureFields;
