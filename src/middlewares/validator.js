const response = require(
    "../utils/response"
);

const validate = (
    schema,
    property = "body"
) => {
    return (req, res, next) => {
        const {
            error,
            value,
        } = schema.validate(
            req[property],
            {
                abortEarly: false,
                stripUnknown: true,
                convert: true,
            }
        );

        if (error) {
            const errors =
                error.details.map(
                    (detail) => ({
                        field:
                            detail.path.join(
                                "."
                            ),
                        message:
                            detail.message.replace(
                                /"/g,
                                ""
                            ),
                    })
                );

            return response.validation(
                res,
                errors,
                "Validasi data gagal"
            );
        }

        req[property] = value;

        next();
    };
};

module.exports = validate;