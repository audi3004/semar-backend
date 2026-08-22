"use strict";

require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");

const CONFIRMATION = "CLEAR-UPLOADS";
const projectRoot = path.resolve(__dirname, "..");
const uploadsRoot = path.resolve(projectRoot, "uploads");

function assertSafeUploadsRoot() {
    const expectedRoot = path.join(projectRoot, "uploads");
    if (uploadsRoot !== expectedRoot || path.dirname(uploadsRoot) !== projectRoot) {
        throw new Error(`Target uploads tidak aman: ${uploadsRoot}`);
    }
}

async function inspectEntry(target) {
    const stat = await fs.lstat(target);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
        return { files: 1, directories: 0, bytes: stat.size };
    }

    const result = { files: 0, directories: 1, bytes: 0 };
    for (const entry of await fs.readdir(target)) {
        const child = await inspectEntry(path.join(target, entry));
        result.files += child.files;
        result.directories += child.directories;
        result.bytes += child.bytes;
    }
    return result;
}

async function clearUploads({ dryRun = true, confirmation } = {}) {
    assertSafeUploadsRoot();
    await fs.mkdir(uploadsRoot, { recursive: true });

    const entries = await fs.readdir(uploadsRoot);
    const summary = { target: uploadsRoot, files: 0, directories: 0, bytes: 0, deleted: false };

    for (const entry of entries) {
        const target = path.resolve(uploadsRoot, entry);
        if (path.dirname(target) !== uploadsRoot) {
            throw new Error(`Target turunan uploads tidak aman: ${target}`);
        }
        const inspected = await inspectEntry(target);
        summary.files += inspected.files;
        summary.directories += inspected.directories;
        summary.bytes += inspected.bytes;
    }

    if (dryRun) return summary;
    if (confirmation !== CONFIRMATION) {
        throw new Error(`Gunakan --confirm=${CONFIRMATION} untuk menghapus seluruh isi uploads`);
    }
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_UPLOAD_CLEANUP !== "true") {
        throw new Error("Pembersihan uploads production memerlukan ALLOW_UPLOAD_CLEANUP=true");
    }

    for (const entry of entries) {
        const target = path.resolve(uploadsRoot, entry);
        await fs.rm(target, { recursive: true, force: false });
    }

    summary.deleted = true;
    return summary;
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

async function run() {
    const args = process.argv.slice(2);
    const confirmationArg = args.find((arg) => arg.startsWith("--confirm="));
    const dryRun = !confirmationArg;
    const confirmation = confirmationArg?.slice("--confirm=".length);

    try {
        const summary = await clearUploads({ dryRun, confirmation });
        console.log(summary.deleted ? "Isi uploads berhasil dibersihkan:" : "Dry-run pembersihan uploads:", {
            ...summary,
            size: formatBytes(summary.bytes),
        });
        if (dryRun && summary.files > 0) {
            console.log(`Jalankan kembali dengan --confirm=${CONFIRMATION} untuk menghapus.`);
        }
    } catch (error) {
        console.error("Pembersihan uploads gagal:", error.message);
        process.exitCode = 1;
    }
}

if (require.main === module) run();

module.exports = { clearUploads, uploadsRoot, CONFIRMATION };
