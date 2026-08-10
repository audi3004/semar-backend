const { sequelize, HariLibur } = require("../models");
const masterData = require("./data/initialMasterData.json");

async function seedHariLibur() {
    const transaction = await sequelize.transaction();
    try {
        for (const item of masterData.m_hari_libur || []) {
            const [record, created] = await HariLibur.findOrCreate({
                where: { tanggal: item.tanggal },
                defaults: { ...item, is_active: "Y" },
                transaction,
            });

            if (!created) {
                await record.update({
                    nama_hari_libur: item.nama_hari_libur,
                    keterangan: item.keterangan || null,
                    is_active: "Y",
                }, { transaction });
            }
        }

        await transaction.commit();
        console.log(`Berhasil menyimpan ${(masterData.m_hari_libur || []).length} hari libur.`);
    } catch (error) {
        await transaction.rollback();
        throw error;
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    seedHariLibur().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

module.exports = seedHariLibur;
