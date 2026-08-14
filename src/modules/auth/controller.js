const authService = require(
    "./service"
);
const response = require(
    "../../utils/response"
);

class AuthController {
    getRefreshToken(req) {
        const cookieHeader = String(req.headers.cookie || "");
        const cookie = cookieHeader
            .split(";")
            .map((item) => item.trim())
            .find((item) => item.startsWith("epresensi_refresh_token="));
        return cookie
            ? decodeURIComponent(cookie.slice(cookie.indexOf("=") + 1))
            : req.body?.refresh_token;
    }

    setRefreshCookie(res, data) {
        res.cookie("epresensi_refresh_token", data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            expires: new Date(data.refresh_token_expires_at),
            path: "/api/auth",
        });
        const { refresh_token, ...safeData } = data;
        return safeData;
    }

    clearRefreshCookie(res) {
        res.clearCookie("epresensi_refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/api/auth",
        });
    }

    async login(req, res) {
        try {
            const data =
                await authService.login(
                    req.body
                );
            return response.success(
                res,
                this.setRefreshCookie(res, data),
                "Login berhasil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }

    async refresh(req, res) {
        try {
            const data =
                await authService
                    .refresh(
                        this.getRefreshToken(req)
                    );
            return response.success(
                res,
                this.setRefreshCookie(res, data),
                "Token berhasil diperbarui"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }

    async logout(req, res) {
        try {
            await authService.logout(
                req.user.id_user
            );
            this.clearRefreshCookie(res);
            return response.success(
                res,
                null,
                "Logout berhasil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }

    async me(req, res) {
        try {
            const data =
                await authService.me(
                    req.user.id_user
                );
            return response.success(
                res,
                data,
                "Profil user berhasil diambil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }
}

const authController = new AuthController();
authController.login = authController.login.bind(authController);
authController.refresh = authController.refresh.bind(authController);
authController.logout = authController.logout.bind(authController);
authController.me = authController.me.bind(authController);

module.exports = authController;
