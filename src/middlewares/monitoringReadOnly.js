const response = require("../utils/response");

module.exports = (req, res, next) => {
    const roleCode = String(req.user?.kode_role || "").trim().toUpperCase();
    if (roleCode === "MONITORING" && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return response.forbidden(
            res,
            "Role Monitoring hanya memiliki akses baca dan unduh data"
        );
    }
    next();
};
