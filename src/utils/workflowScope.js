const { UnitRole } = require("../models");

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
            attributes: ["id_unit"],
            raw: true,
        });

    return {
        idRole: user.id_role,
        unitIds: [
            ...new Set(
                assignments.map(
                    (item) => item.id_unit
                )
            ),
        ],
    };
}

module.exports = getWorkflowScope;
