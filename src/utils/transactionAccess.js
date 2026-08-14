const AppError = require("./appError");

const isMaker = (user) =>
    String(user?.kode_role || "").trim().toUpperCase() === "MAKER";

const scopeTransactionFilters = (filters = {}, user = null) => {
    if (!isMaker(user)) return filters;

    if (!user?.id_petugas) {
        throw new AppError("Akun maker belum terhubung dengan data petugas", 403);
    }

    return { ...filters, id_petugas: user.id_petugas };
};

const assertTransactionOwner = (transaction, user = null) => {
    if (
        isMaker(user) &&
        String(transaction?.id_petugas || "") !== String(user?.id_petugas || "")
    ) {
        throw new AppError("Data transaksi tidak ditemukan", 404);
    }

    return transaction;
};

module.exports = { scopeTransactionFilters, assertTransactionOwner };
