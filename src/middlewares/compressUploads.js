const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");

const KB = 1024;
const IMAGE_INPUT_LIMIT = 500 * KB;
const PDF_INPUT_LIMIT = 1024 * KB;
const IMAGE_TARGET = 25 * KB;
const PDF_TARGET = 100 * KB;

const allFiles = (req) => Object.values(req.files || {}).flat();

const removeFiles = async (files) => {
    await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
};

const compressImage = async (file) => {
    if (file.size <= IMAGE_TARGET) return;
    const source = await fs.readFile(file.path);
    let best = source;
    const widths = [1600, 1200, 900, 700, 500, 360];
    const qualities = [80, 70, 60, 50, 40, 30, 22];

    for (const width of widths) {
        for (const quality of qualities) {
            const candidate = await sharp(source, { failOn: "none" })
                .rotate()
                .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
                .flatten({ background: "#ffffff" })
                .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" })
                .toBuffer();
            if (candidate.length < best.length) best = candidate;
            if (candidate.length <= IMAGE_TARGET) break;
        }
        if (best.length <= IMAGE_TARGET) break;
    }

    const oldPath = file.path;
    const newName = `${path.basename(file.filename, path.extname(file.filename))}.jpg`;
    const newPath = path.join(path.dirname(oldPath), newName);
    await fs.writeFile(newPath, best);
    if (newPath !== oldPath) await fs.unlink(oldPath).catch(() => {});
    file.filename = newName;
    file.path = newPath;
    file.mimetype = "image/jpeg";
    file.size = best.length;
};

const optimizePdf = async (file) => {
    if (file.size <= PDF_TARGET) return;
    const original = await fs.readFile(file.path);
    try {
        const document = await PDFDocument.load(original, { updateMetadata: false });
        const optimized = Buffer.from(await document.save({ useObjectStreams: true, addDefaultPage: false }));
        if (optimized.length < original.length) {
            await fs.writeFile(file.path, optimized);
            file.size = optimized.length;
        }
    } catch (error) {
        // PDF terenkripsi/format khusus tetap diterima selama lolos batas 1 MB.
        console.warn(`PDF ${file.originalname} tidak dapat dioptimasi: ${error.message}`);
    }
};

module.exports = async (req, res, next) => {
    const files = allFiles(req);
    try {
        for (const file of files) {
            const isPdf = file.mimetype === "application/pdf";
            const limit = isPdf ? PDF_INPUT_LIMIT : IMAGE_INPUT_LIMIT;
            if (file.size > limit) {
                await removeFiles(files);
                return res.status(422).json({
                    success: false,
                    message: isPdf
                        ? "Ukuran PDF maksimal 1 MB"
                        : "Ukuran foto maksimal 500 KB",
                });
            }
            if (isPdf) await optimizePdf(file);
            else if (file.mimetype.startsWith("image/")) await compressImage(file);
        }
        next();
    } catch (error) {
        await removeFiles(files);
        next(error);
    }
};

module.exports.limits = { IMAGE_INPUT_LIMIT, PDF_INPUT_LIMIT, IMAGE_TARGET, PDF_TARGET };
