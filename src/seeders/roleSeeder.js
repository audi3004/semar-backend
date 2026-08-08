const {
    Role,
} = require(
    "../models"
);

const seedRoles = async () => {
    const roles = [
        {
            kode_role:
                "MAKER",
            nama_role:
                "Maker",
            level_role: 10,
            is_super_admin:
                "N",
            is_active: "Y",
        },

        {
            kode_role:
                "CHECKER",
            nama_role:
                "Checker",
            level_role: 20,
            is_super_admin:
                "N",
            is_active: "Y",
        },

        {
            kode_role:
                "VERIFICATION",
            nama_role:
                "Verification",
            level_role: 30,
            is_super_admin:
                "N",
            is_active: "Y",
        },

        {
            kode_role:
                "APPROVAL_1",
            nama_role:
                "Approval 1",
            level_role: 40,
            is_super_admin:
                "N",
            is_active: "Y",
        },

        {
            kode_role:
                "APPROVAL_2",
            nama_role:
                "Approval 2",
            level_role: 50,
            is_super_admin:
                "N",
            is_active: "Y",
        },

        {
            kode_role:
                "APPROVAL_3",
            nama_role:
                "Approval 3",
            level_role: 60,
            is_super_admin:
                "N",
            is_active: "Y",
        },

        {
            kode_role:
                "ADMIN",
            nama_role:
                "Administrator",
            level_role: 90,
            is_super_admin:
                "N",
            is_active: "Y",
        },

        {
            kode_role:
                "SUPER_ADMIN",
            nama_role:
                "Super Administrator",
            level_role: 100,
            is_super_admin:
                "Y",
            is_active: "Y",
        },
    ];

    for (
        const role of roles
    ) {
        await Role.findOrCreate({
            where: {
                kode_role:
                    role.kode_role,
            },

            defaults: role,
        });
    }

    console.log(
        "Role berhasil dibuat"
    );
};

module.exports =
    seedRoles;