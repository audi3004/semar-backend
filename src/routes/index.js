const express = require("express");

const authRoute = require(
    "../modules/auth/route"
);
const authenticate = require(
    "../middlewares/auth"
);

const roleRoute = require(
    "../modules/role/route"
);
const projectRoute = require(
    "../modules/project/route"
);
const jabatanRoute = require(
    "../modules/jabatan/route"
);
const umkRoute = require(
    "../modules/umk/route"
);
const hariLiburRoute = require(
    "../modules/hariLibur/route"
);

const koefTmkRoute = require(
    "../modules/koefTmk/route"
);

const gajiRoute = require(
    "../modules/gaji/route"
);

const unitRoute = require(
    "../modules/unit/route"
);

const unitRoleRoute = require(
    "../modules/unitRole/route"
);

const pegawaiRoute = require(
    "../modules/pegawai/route"
);

const petugasRoute = require(
    "../modules/petugas/route"
);

const userRoute = require(
    "../modules/user/route"
);

const moduleRoute = require(
    "../modules/module/route"
);

const accessModuleRoute = require(
    "../modules/accessModule/route"
);

const statusRoute = require(
    "../modules/status/route"
);

const mutasiRoute = require(
    "../modules/mutasi/route"
);

const lemburRoute = require(
    "../modules/lembur/route"
);

const logLemburRoute = require(
    "../modules/logLembur/route"
);

const cutiRoute = require(
    "../modules/cuti/route"
);

const logCutiRoute = require(
    "../modules/logCuti/route"
);

const ijinRoute = require(
    "../modules/ijin/route"
);

const logIjinRoute = require(
    "../modules/logIjin/route"
);

const sakitRoute = require(
    "../modules/sakit/route"
);

const logSakitRoute = require(
    "../modules/logSakit/route"
);

const sppdRoute = require(
    "../modules/sppd/route"
);

const logSppdRoute = require(
    "../modules/logSppd/route"
);
const dashboardRoute = require("../modules/dashboard/route");





const router = express.Router();

router.use("/auth", authRoute);

router.use(authenticate);

router.use("/dashboard", dashboardRoute);

router.use("/roles", roleRoute);
router.use("/projects", projectRoute);
router.use("/jabatan", jabatanRoute);
router.use("/umk", umkRoute);
router.use(
    "/hari-libur",
    hariLiburRoute
);
router.use(
    "/koef-tmk",
    koefTmkRoute
);
router.use("/gaji", gajiRoute);
router.use("/unit", unitRoute);
router.use(
    "/unit-role",
    unitRoleRoute
);
router.use("/pegawai", pegawaiRoute);
router.use("/petugas", petugasRoute);
router.use("/users", userRoute);
router.use("/modules", moduleRoute);
router.use(
    "/access-modules",
    accessModuleRoute
);
router.use(
    "/status",
    statusRoute
);
router.use("/mutasi", mutasiRoute);
router.use("/lembur", lemburRoute);
router.use(
    "/log-lembur",
    logLemburRoute
);
router.use("/cuti", cutiRoute);
router.use(
    "/log-cuti",
    logCutiRoute
);
router.use("/ijin", ijinRoute);
router.use(
    "/log-ijin",
    logIjinRoute
);
router.use("/sakit", sakitRoute);
router.use(
    "/log-sakit",
    logSakitRoute
);
router.use("/sppd", sppdRoute);
router.use(
    "/log-sppd",
    logSppdRoute
);

module.exports = router;
