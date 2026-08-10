const { sequelize, Pegawai, Petugas } = require("../models");

async function fixTeamLeaderJabatan() {
    const transaction = await sequelize.transaction();
    try {
        const [pegawaiUpdated] = await Pegawai.update(
            { id_jabatan: 6 },
            { where: { id_jabatan: 5 }, transaction }
        );
        const [petugasUpdated] = await Petugas.update(
            { id_jabatan: 6 },
            { where: { id_jabatan: 5 }, transaction }
        );

        await transaction.commit();
        console.log(`Mapping diperbaiki: ${pegawaiUpdated} pegawai, ${petugasUpdated} petugas.`);
    } catch (error) {
        await transaction.rollback();
        throw error;
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    fixTeamLeaderJabatan().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

module.exports = fixTeamLeaderJabatan;
