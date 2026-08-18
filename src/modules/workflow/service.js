const AppError = require("../../utils/appError");
const { assertWorkflowAssignment } = require("../../utils/workflowAction");
const lemburService = require("../lembur/service");
const cutiService = require("../cuti/service");
const ijinService = require("../ijin/service");
const sakitService = require("../sakit/service");
const sppdService = require("../sppd/service");

const services = {
    lembur: lemburService,
    cuti: cutiService,
    ijin: ijinService,
    sakit: sakitService,
    sppd: sppdService,
};

const idFields = {
    lembur: "id_lembur",
    cuti: "id_cuti",
    ijin: "id_ijin",
    sakit: "id_sakit",
    sppd: "id_sppd",
};

class WorkflowService {
    parseTransactions(value) {
        let transactions = value;
        if (typeof transactions === "string") {
            try {
                transactions = JSON.parse(transactions);
            } catch {
                throw new AppError("Daftar transaksi tidak valid", 422);
            }
        }

        if (!Array.isArray(transactions) || transactions.length === 0) {
            throw new AppError("Pilih minimal satu transaksi", 422);
        }
        if (transactions.length > 100) {
            throw new AppError("Maksimal 100 transaksi dalam satu kali approval", 422);
        }

        const unique = new Map();
        for (const item of transactions) {
            const type = String(item?.type || "").trim().toLowerCase();
            const id = Number(item?.id);
            if (!services[type] || !Number.isInteger(id) || id <= 0) {
                throw new AppError("Terdapat jenis atau ID transaksi yang tidak valid", 422);
            }
            unique.set(`${type}:${id}`, { type, id });
        }
        return [...unique.values()];
    }

    async bulkApprove(rawTransactions, signaturePath, user) {
        const role = String(user?.kode_role || "").trim().toUpperCase();
        const signatureFields = {
            APPROVAL_1: "approval_1_signature",
            APPROVAL_2: "approval_2_signature",
            APPROVAL_3: "approval_3_signature",
        };
        const signatureField = signatureFields[role];
        if (!signatureField) {
            throw new AppError("Fitur approval massal hanya tersedia untuk Role Approval 1, 2, dan 3", 403);
        }
        if (!signaturePath) {
            throw new AppError("Tanda tangan approver wajib dibubuhkan", 422);
        }

        const transactions = this.parseTransactions(rawTransactions);
        if (role === "APPROVAL_2" && transactions.some((item) => item.type === "sppd")) {
            throw new AppError("Approval 2 tidak dapat menyetujui massal transaksi SPPD karena biaya harus disesuaikan terlebih dahulu", 422);
        }

        // Validate the complete batch before changing any status.
        for (const item of transactions) {
            const service = services[item.type];
            const transaction = await service[`check${item.type === "sppd" ? "Sppd" : item.type[0].toUpperCase() + item.type.slice(1)}`](item.id);
            service.validateStatusAuthority(transaction.status, user);
            await assertWorkflowAssignment(transaction, user);
            if (transaction.status?.is_final === "Y" || !transaction.status?.id_status_next) {
                throw new AppError(`Transaksi ${item.type.toUpperCase()} #${item.id} tidak dapat dilanjutkan`, 400);
            }
        }

        const results = [];
        for (const item of transactions) {
            const result = await services[item.type].moveToNextStatus(
                item.id,
                user,
                { [signatureField]: signaturePath }
            );
            results.push({ type: item.type, id: result[idFields[item.type]] || item.id });
        }

        return { total: results.length, transactions: results };
    }
}

module.exports = new WorkflowService();
