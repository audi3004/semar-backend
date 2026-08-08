const authService = require(
    "./service"
);
const response = require(
    "../../utils/response"
);

class AuthController {
    async login(req, res) {
        try {
            const data =
                await authService.login(
                    req.body
                );
            return response.success(
                res,
                data,
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
                        req.body
                            .refresh_token
                    );
            return response.success(
                res,
                data,
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

module.exports =
    new AuthController();
