require("dotenv").config();

const { sequelize, Unit } = require("../models");
const data = require("./data/initialMasterData.json");

async function seedUnitCoordinates() {
    await sequelize.authenticate();
    return sequelize.transaction(async (transaction) => {
        let updated = 0;
        let withCoordinates = 0;
        let emptyCoordinates = 0;

        for (const row of data.m_unit) {
            const lat = row.lat ?? null;
            const lon = row.lon ?? null;
            const [affected] = await Unit.update(
                { lat, lon, updated_at: new Date() },
                { where: { nama_unit: row.nama_unit }, transaction }
            );
            if (!affected) throw new Error(`Unit ${row.nama_unit} tidak ditemukan pada database`);
            updated += affected;
            if (lat == null && lon == null) emptyCoordinates += 1;
            else withCoordinates += 1;
        }

        return { updated, withCoordinates, emptyCoordinates };
    });
}

async function run() {
    try {
        console.log("Koordinat unit berhasil disinkronkan:", await seedUnitCoordinates());
    } catch (error) {
        console.error("Sinkronisasi koordinat unit gagal:", error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) run();
module.exports = seedUnitCoordinates;
