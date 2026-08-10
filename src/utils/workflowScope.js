const { UnitRole } = require("../models");
const { getSelfAndDescendantIds } = require("./unitHierarchy");

const APPROVAL_ROLES = new Set([
    "CHECKER",
    "VERIFICATION",
    "APPROVAL_1",
    "APPROVAL_2",
    "APPROVAL_3",
]);

async function getWorkflowScope(user) {
    const roleCode = String(
        user?.kode_role ?? ""
    ).toUpperCase();

    if (
        user?.is_super_admin === "Y" ||
        roleCode === "SUPER_ADMIN" ||
        roleCode === "ADMIN"
    ) {
        return null;
    }

    if (!APPROVAL_ROLES.has(roleCode)) {
        return {
            idRole: user?.id_role,
            unitIds: [],
        };
    }

    const assignments =
        await UnitRole.findAll({
            where: {
                id_user: user.id_user,
                id_role: user.id_role,
                is_active: "Y",
            },
            attributes: ["id_unit", "scope_type"],
            raw: true,
        });

    const unitIds = new Set();
    for (const assignment of assignments) {
        const resolved = assignment.scope_type === "SELF_AND_DESCENDANTS"
            ? await getSelfAndDescendantIds(assignment.id_unit)
            : [Number(assignment.id_unit)];
        resolved.forEach((id) => unitIds.add(id));
    }

    return {
        idRole: user.id_role,
        unitIds: [...unitIds],
    };
}

module.exports = getWorkflowScope;
