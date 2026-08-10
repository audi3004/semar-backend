const bcrypt = require("bcrypt");
const { sequelize, User, Petugas } = require("../models");

const formatPassword = (dateValue) => {
    const [year, month, day] = String(dateValue || "").slice(0, 10).split("-");
    return year && month && day ? `${day}${month}${year}` : null;
};

async function resetPetugasPasswordsFromBirthDate() {
    const transaction = await sequelize.transaction();
    try {
        const users = await User.findAll({
            where: { id_petugas: { [require("sequelize").Op.ne]: null } },
            include: [{ model: Petugas, as: "petugas", required: true, attributes: ["id_petugas", "nip", "nama", "tgl_lahir"] }],
            transaction,
        });
        let updated = 0;
        const skipped = [];
        for (const user of users) {
            const password = formatPassword(user.petugas?.tgl_lahir);
            if (!password) {
                skipped.push({ id_user: user.id_user, nip: user.petugas?.nip, nama: user.petugas?.nama });
                continue;
            }
            await user.update({
                password: await bcrypt.hash(password, 12),
                refresh_token_hash: null,
                refresh_token_expires_at: null,
                updated_at: new Date(),
            }, { transaction });
            updated += 1;
        }
        await transaction.commit();
        console.log(JSON.stringify({ updated, skipped_count: skipped.length, skipped }, null, 2));
    } catch (error) {
        await transaction.rollback();
        throw error;
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    resetPetugasPasswordsFromBirthDate().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

module.exports = resetPetugasPasswordsFromBirthDate;
