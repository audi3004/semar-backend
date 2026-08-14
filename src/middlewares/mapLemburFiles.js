const path = require("path");
const response = require("../utils/response");
const { getRelativeDirectory } = require("./uploadLembur");

const evidenceFields = ["foto_kegiatan_1", "foto_kegiatan_2", "surat_perintah_lembur"];
const signatureFields = ["maker_signature", "checker_signature", "verification_signature", "approval_1_signature", "approval_2_signature", "approval_3_signature"];

const areActivityPhotosOptional = (body = {}) => {
    const category = String(body.kategori_lembur || "").trim().toLowerCase();
    const jobType = String(body.jenis_pekerjaan || "").trim().toLowerCase();
    const evidenceText = `${category} ${jobType}`;

    return category === "piket tanggal merah / cuti pengganti" || [
        "pengganti cuti",
        "cuti pengganti",
        "cuti penganti",
        "pengganti piket",
        "libur nasional",
        "tanggal merah",
    ].some((keyword) => evidenceText.includes(keyword));
};

module.exports = (requiredEvidence = false) => (req, res, next) => {
    const requiredFields = requiredEvidence?.filter
        ? requiredEvidence
        : requiredEvidence
            ? areActivityPhotosOptional(req.body)
                ? ["surat_perintah_lembur"]
                : evidenceFields
            : [];
    const missing = requiredFields.filter((field) => !req.files?.[field]?.[0]);

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
module.exports.areActivityPhotosOptional = areActivityPhotosOptional;
