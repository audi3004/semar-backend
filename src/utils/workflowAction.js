const { Op } = require("sequelize");
const { Status, Role, UnitRole, User } = require("../models");
const AppError = require("./appError");

const ROLE_ALIASES = {
    maker: "MAKER",
    checker: "CHECKER",
    verification: "VERIFICATION",
    approved1: "APPROVAL_1",
    approved2: "APPROVAL_2",
    approved3: "APPROVAL_3",
    approval_1: "APPROVAL_1",
    approval_2: "APPROVAL_2",
    approval_3: "APPROVAL_3",
};
const APPROVAL_ROLES = new Set(["CHECKER", "VERIFICATION", "APPROVAL_1", "APPROVAL_2", "APPROVAL_3"]);

function isAdmin(user) {
    const code = String(user?.kode_role || "").toUpperCase();
    return user?.is_super_admin === "Y" || code === "ADMIN" || code === "SUPER_ADMIN";
}

async function assertWorkflowAssignment(transaction, user) {
    if (isAdmin(user)) return;
    if (!APPROVAL_ROLES.has(String(user?.kode_role || "").toUpperCase())) return;
    const idUnit = transaction?.petugas?.id_unit;
    if (!idUnit) throw new AppError("Unit transaksi tidak ditemukan", 400);

    const assignment = await UnitRole.findOne({
        where: {
            id_user: user.id_user,
            id_role: user.id_role,
            id_unit: idUnit,
            is_active: "Y",
        },
    });
    if (!assignment) {
        throw new AppError("Anda tidak memiliki assignment role aktif pada unit transaksi ini", 403);
    }
}

async function resolveRevisionStatus(currentStatus, targetRole) {
    const normalized = ROLE_ALIASES[String(targetRole || "").toLowerCase()];
    if (!normalized) throw new AppError("Target role revisi wajib diisi dan tidak valid", 400);

    const role = await Role.findOne({ where: { kode_role: normalized, is_active: "Y" } });
    if (!role) throw new AppError("Role tujuan revisi tidak ditemukan atau tidak aktif", 404);

    const destination = await Status.findOne({
        where: {
            id_role: role.id_role,
            is_active: "Y",
            is_final: "N",
            urutan_status: { [Op.lt]: currentStatus.urutan_status },
        },
        order: [["urutan_status", "DESC"]],
    });
    if (!destination) {
        throw new AppError("Target revisi harus memiliki level status lebih rendah dari status saat ini", 400);
    }
    return destination;
}

async function hasActiveAssignee(idUnit, idRole) {
    return (await UnitRole.count({
        where: {
            id_unit: idUnit,
            id_role: idRole,
            is_active: "Y",
        },
        include: [{
            model: User,
            as: "user",
            required: true,
            attributes: [],
            where: { is_active: "Y" },
        }],
        distinct: true,
        col: "id_unit_role",
    })) > 0;
}

async function resolveNextStatusWithBypass(currentStatus, idUnit) {
    if (!idUnit) throw new AppError("Unit transaksi tidak ditemukan", 400);

    const bypassed = [];
    const visited = new Set([currentStatus.id_status]);
    let nextId = currentStatus.id_status_next;

    while (nextId) {
        if (visited.has(nextId)) {
            throw new AppError("Konfigurasi workflow membentuk siklus status", 500);
        }
        visited.add(nextId);

        const candidate = await Status.findByPk(nextId, {
            include: [{ model: Role, as: "role", required: false }],
        });
        if (!candidate) throw new AppError(`Status berikutnya (${nextId}) tidak ditemukan`, 404);
        if (candidate.is_active !== "Y") {
            throw new AppError(`Status ${candidate.nama_status} sedang tidak aktif`, 400);
        }

        // Final/system statuses do not require an assigned approver.
        if (!candidate.id_role || candidate.is_final === "Y") {
            return { status: candidate, bypassed };
        }

        if (await hasActiveAssignee(idUnit, candidate.id_role)) {
            return { status: candidate, bypassed };
        }

        bypassed.push({
            id_status: candidate.id_status,
            kode_status: candidate.kode_status,
            nama_status: candidate.nama_status,
            id_role: candidate.id_role,
            kode_role: candidate.role?.kode_role || null,
            reason: `Tidak ada user aktif dengan role ${candidate.role?.kode_role || candidate.id_role} pada unit ${idUnit}`,
        });
        nextId = candidate.id_status_next;
    }

    throw new AppError("Tidak ada status tujuan yang dapat diproses setelah auto-skip", 400);
}

module.exports = {
    assertWorkflowAssignment,
    resolveRevisionStatus,
    resolveNextStatusWithBypass,
    hasActiveAssignee,
};
