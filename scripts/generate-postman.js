const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(
    __dirname,
    ".."
);

const outputDirectory = path.join(
    projectRoot,
    "postman"
);

const outputFile = path.join(
    outputDirectory,
    "Workforce Management Backend.postman_collection.json"
);

const modules = [
    ["auth", "auth"],
    ["role", "roles"],
    ["project", "projects"],
    ["jabatan", "jabatan"],
    ["umk", "umk"],
    ["hariLibur", "hari-libur"],
    ["koefTmk", "koef-tmk"],
    ["gaji", "gaji"],
    ["unit", "unit"],
    ["unitRole", "unit-role"],
    ["pegawai", "pegawai"],
    ["petugas", "petugas"],
    ["user", "users"],
    ["module", "modules"],
    [
        "accessModule",
        "access-modules",
    ],
    ["status", "status"],
    ["mutasi", "mutasi"],
    ["lembur", "lembur"],
    [
        "logLembur",
        "log-lembur",
    ],
    ["cuti", "cuti"],
    ["logCuti", "log-cuti"],
    ["ijin", "ijin"],
    ["logIjin", "log-ijin"],
    ["sakit", "sakit"],
    ["logSakit", "log-sakit"],
    ["sppd", "sppd"],
    ["logSppd", "log-sppd"],
];

const sampleOverrides = {
    refresh_token:
        "{{refresh_token}}",
    email: "user@example.com",
    username: "adminuser",
    password: "Password123",
    old_password: "Password123",
    new_password: "NewPassword123",
    confirm_password:
        "NewPassword123",
    no_cuti: "CUTI/00001/2026",
    no_ijin: "IJIN/00001/2026",
    no_sakit: "SAKIT/00001/2026",
    no_sppd: "SPPD/00001/2026",
    no_lembur: "LEMBUR/00001/2026",
    kode_role: "ADMIN",
    kode_status: "DRAFT",
    kode_module: "CUTI",
    kode_project: "PRJ001",
    kode_unit: "UNIT001",
    kode_jabatan: "JBT001",
    kode_divisi: "DIV001",
    is_active: "Y",
    is_final: "N",
    is_initial: "N",
    can_create: "Y",
    can_read: "Y",
    can_update: "Y",
    can_delete: "Y",
    can_approve: "Y",
    tgl_pengajuan: "2026-07-29",
    tgl_mulai: "2026-08-01",
    tgl_selesai: "2026-08-03",
    tgl_awal: "2026-07-01",
    tgl_akhir: "2026-07-31",
    tgl_awal_filter: "2026-07-01",
    tgl_akhir_filter: "2026-07-31",
    start_mutasi: "2026-08-01",
};

function titleCase(value) {
    return value
        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        )
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (character) =>
            character.toUpperCase()
        );
}

function sampleValue(
    fieldName,
    description = {}
) {
    if (
        Object.prototype.hasOwnProperty.call(
            sampleOverrides,
            fieldName
        )
    ) {
        return sampleOverrides[
            fieldName
        ];
    }

    if (
        description.flags &&
        Object.prototype.hasOwnProperty.call(
            description.flags,
            "default"
        )
    ) {
        return description.flags.default;
    }

    if (
        description.allow &&
        description.allow.length
    ) {
        const allowed =
            description.allow.find(
                (value) =>
                    value !== null &&
                    value !== ""
            );

        if (allowed !== undefined) {
            return allowed;
        }
    }

    if (description.type === "object") {
        return sampleObject(
            description
        );
    }

    if (description.type === "array") {
        const item =
            description.items?.[0];

        return item
            ? [
                sampleValue(
                    fieldName,
                    item
                ),
            ]
            : [];
    }

    if (description.type === "number") {
        if (
            fieldName.startsWith("id_") ||
            fieldName === "id"
        ) {
            return 1;
        }

        return 1000;
    }

    if (description.type === "boolean") {
        return true;
    }

    if (description.type === "date") {
        return "2026-07-29";
    }

    if (
        fieldName.startsWith("id_") ||
        fieldName === "id"
    ) {
        return 1;
    }

    if (
        fieldName.startsWith("tgl_") ||
        fieldName.includes("tanggal") ||
        fieldName.endsWith("_date")
    ) {
        return "2026-07-29";
    }

    if (fieldName.startsWith("is_")) {
        return "Y";
    }

    if (fieldName.startsWith("kode_")) {
        return "CODE001";
    }

    if (fieldName.startsWith("nama_")) {
        return `Contoh ${titleCase(
            fieldName.slice(5)
        )}`;
    }

    if (
        fieldName.includes("nominal") ||
        fieldName.includes("jumlah") ||
        fieldName.includes("nilai") ||
        fieldName.includes("lama_") ||
        fieldName.includes("tahun")
    ) {
        return 1;
    }

    return `Contoh ${titleCase(
        fieldName
    )}`;
}

function sampleObject(
    description = {}
) {
    const result = {};

    for (const [
        key,
        child,
    ] of Object.entries(
        description.keys || {}
    )) {
        result[key] = sampleValue(
            key,
            child
        );
    }

    return result;
}

function parseRouteSchemas(
    routeSource
) {
    const result = [];
    const routePattern =
        /router\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']([\s\S]*?)(?=\n\s*router\.|\n\s*module\.exports)/gi;

    for (
        const match of routeSource.matchAll(
            routePattern
        )
    ) {
        const method =
            match[1].toUpperCase();
        const routePath = match[2];
        const block = match[3];
        const schemas = [];
        const schemaPattern =
            /validate\s*\(\s*(?:schema|validator)\.(\w+)(?:\s*,\s*["'](\w+)["'])?\s*\)/gi;

        for (
            const schemaMatch of block.matchAll(
                schemaPattern
            )
        ) {
            schemas.push({
                name: schemaMatch[1],
                target:
                    schemaMatch[2] ||
                    "body",
            });
        }

        const controllerMatch =
            block.match(
                /controller\.(\w+)/
            );

        result.push({
            method,
            path: routePath,
            schemas,
            controller:
                controllerMatch?.[1] ||
                `${method} ${routePath}`,
        });
    }

    return result;
}

function getSchemaDescription(
    validator,
    schemaName
) {
    const schema =
        validator?.[schemaName];

    if (
        !schema ||
        typeof schema.describe !==
        "function"
    ) {
        return null;
    }

    return schema.describe();
}

function createQuery(
    description
) {
    return Object.entries(
        description?.keys || {}
    ).map(
        ([
            key,
            child,
        ]) => ({
            key,
            value: String(
                sampleValue(
                    key,
                    child
                )
            ),
            description:
                child.flags?.presence ===
                "required"
                    ? "Wajib"
                    : "Opsional",
            disabled:
                child.flags?.presence !==
                "required",
        })
    );
}

function responseHeaders() {
    return [
        {
            key: "Content-Type",
            value:
                "application/json; charset=utf-8",
        },
    ];
}

function getSuccessData(
    prefix,
    route
) {
    if (prefix === "auth") {
        if (
            [
                "/login",
                "/refresh",
            ].includes(route.path)
        ) {
            return {
                user: {
                    id_user: 1,
                    username:
                        "superadmin",
                    email:
                        "admin@example.com",
                    id_pegawai: null,
                    id_petugas: null,
                    id_role: 1,
                    is_active: "Y",
                    role: {
                        id_role: 1,
                        kode_role:
                            "SUPER_ADMIN",
                        nama_role:
                            "Super Administrator",
                        level_role: 100,
                        is_super_admin:
                            "Y",
                        is_active: "Y",
                    },
                },
                token_type: "Bearer",
                access_token:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-access-token",
                access_token_expires_in:
                    "15m",
                refresh_token:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-refresh-token",
                refresh_token_expires_at:
                    "2026-08-08T03:00:00.000Z",
                payload: {
                    id_user: 1,
                    username:
                        "superadmin",
                    email:
                        "admin@example.com",
                    id_pegawai: null,
                    id_petugas: null,
                    id_role: 1,
                    kode_role:
                        "SUPER_ADMIN",
                    nama_role:
                        "Super Administrator",
                    level_role: 100,
                    is_super_admin:
                        "Y",
                },
            };
        }

        if (route.path === "/me") {
            return {
                id_user: 1,
                username:
                    "superadmin",
                email:
                    "admin@example.com",
                id_pegawai: null,
                id_petugas: null,
                id_role: 1,
                is_active: "Y",
                role: {
                    id_role: 1,
                    kode_role:
                        "SUPER_ADMIN",
                    nama_role:
                        "Super Administrator",
                    level_role: 100,
                    is_super_admin:
                        "Y",
                    is_active: "Y",
                },
            };
        }

        return null;
    }

    if (route.method === "DELETE") {
        return undefined;
    }

    const listControllers = [
        "findAll",
        "findAllWithInactive",
        "findPending",
        "findApprovers",
    ];

    if (
        listControllers.includes(
            route.controller
        ) ||
        (
            route.controller.startsWith(
                "findBy"
            ) &&
            route.controller !==
            "findById"
        )
    ) {
        return [
            {
                id: 1,
                sample:
                    `Contoh data ${titleCase(
                        prefix
                    )}`,
            },
        ];
    }

    if (
        route.controller ===
        "hasAuthority"
    ) {
        return {
            has_authority: true,
            unit_role: {
                id_unit_role: 1,
            },
        };
    }

    return {
        id: 1,
        sample:
            `Contoh data ${titleCase(
                prefix
            )}`,
    };
}

function createSuccessExample(
    prefix,
    route,
    request
) {
    const isCreated =
        route.method === "POST" &&
        prefix !== "auth";
    const code = isCreated
        ? 201
        : 200;
    const data = getSuccessData(
        prefix,
        route
    );
    const authMessages = {
        login: "Login berhasil",
        refresh:
            "Token berhasil diperbarui",
        logout: "Logout berhasil",
        me: "Profil user berhasil diambil",
    };
    const body = {
        success: true,
        message:
            prefix === "auth"
                ? authMessages[
                    route.controller
                ]
                : isCreated
                ? "Data berhasil ditambahkan"
                : route.method ===
                    "DELETE"
                    ? "Data berhasil dihapus"
                    : "Request berhasil diproses",
    };

    if (data !== undefined) {
        body.data = data;
    }

    return {
        name: `Success - ${code}`,
        originalRequest:
            JSON.parse(
                JSON.stringify(
                    request
                )
            ),
        status:
            code === 201
                ? "Created"
                : "OK",
        code,
        _postman_previewlanguage:
            "json",
        header:
            responseHeaders(),
        cookie: [],
        body: JSON.stringify(
            body,
            null,
            2
        ),
    };
}

function createFailedExample(
    prefix,
    route,
    request
) {
    const isPublicAuth =
        prefix === "auth" &&
        [
            "/login",
            "/refresh",
        ].includes(route.path);
    const hasInputValidation =
        route.schemas.some(
            (schema) =>
                schema.target ===
                "body" ||
                schema.target ===
                "query"
        );
    const hasResourceId =
        route.path.includes(":id");

    let code;
    let status;
    let body;

    if (isPublicAuth) {
        code = 401;
        status = "Unauthorized";
        body = {
            success: false,
            message:
                route.path ===
                "/login"
                    ? "Username atau password tidak sesuai"
                    : "Refresh token tidak valid atau sudah kedaluwarsa",
        };
    } else if (hasInputValidation) {
        const schemaRef =
            route.schemas.find(
                (schema) =>
                    schema.target ===
                    "body" ||
                    schema.target ===
                    "query"
            );
        code = 422;
        status =
            "Unprocessable Entity";
        let field =
            "field";

        if (
            schemaRef?.target ===
            "query"
        ) {
            field =
                request.url
                    .query?.[0]
                    ?.key ||
                "query_parameter";
        } else if (
            request.body?.raw
        ) {
            const requestBody =
                JSON.parse(
                    request.body.raw
                );
            field =
                Object.keys(
                    requestBody
                )[0] || "field";
        }

        body = {
            success: false,
            message:
                "Validasi data gagal",
            errors: [
                {
                    field,
                    message:
                        `${field} tidak valid`,
                },
            ],
        };
    } else if (hasResourceId) {
        code = 404;
        status = "Not Found";
        body = {
            success: false,
            message:
                "Data tidak ditemukan",
        };
    } else {
        code = 401;
        status = "Unauthorized";
        body = {
            success: false,
            message:
                "Access token wajib disertakan",
        };
    }

    return {
        name: `Failed - ${code}`,
        originalRequest:
            JSON.parse(
                JSON.stringify(
                    request
                )
            ),
        status,
        code,
        _postman_previewlanguage:
            "json",
        header:
            responseHeaders(),
        cookie: [],
        body: JSON.stringify(
            body,
            null,
            2
        ),
    };
}

function createRequest(
    prefix,
    route,
    validator
) {
    const completePath =
        `/api/${prefix}${route.path === "/"
            ? ""
            : route.path
        }`;

    const rawUrl =
        `{{base_url}}${completePath}`;

    const pathParts = [
        "api",
        prefix,
        ...route.path
            .split("/")
            .filter(Boolean),
    ];

    const variables = pathParts
        .filter((part) =>
            part.startsWith(":")
        )
        .map((part) => ({
            key: part.slice(1),
            value: "1",
            description:
                `Contoh ${titleCase(
                    part.slice(1)
                )}`,
        }));

    let query = [];
    let body = null;

    for (const schemaRef of route.schemas) {
        const description =
            getSchemaDescription(
                validator,
                schemaRef.name
            );

        if (!description) {
            continue;
        }

        if (
            schemaRef.target ===
            "query"
        ) {
            query = createQuery(
                description
            );
        }

        if (
            schemaRef.target ===
            "body"
        ) {
            body = sampleObject(
                description
            );
        }
    }

    const request = {
        method: route.method,
        header: [],
        url: {
            raw: rawUrl,
            host: [
                "{{base_url}}",
            ],
            path: pathParts,
        },
        description:
            `${route.method} ${completePath}`,
    };

    if (
        prefix === "auth" &&
        [
            "/login",
            "/refresh",
        ].includes(route.path)
    ) {
        request.auth = {
            type: "noauth",
        };
    }

    if (variables.length) {
        request.url.variable =
            variables;
    }

    if (query.length) {
        request.url.query = query;
    }

    if (body !== null) {
        request.header.push({
            key: "Content-Type",
            value:
                "application/json",
            type: "text",
        });

        request.body = {
            mode: "raw",
            raw: JSON.stringify(
                body,
                null,
                2
            ),
            options: {
                raw: {
                    language: "json",
                },
            },
        };
    }

    const item = {
        name: titleCase(
            route.controller
        ),
        request,
        response: [
            createSuccessExample(
                prefix,
                route,
                request
            ),
            createFailedExample(
                prefix,
                route,
                request
            ),
        ],
    };

    if (
        prefix === "auth" &&
        [
            "/login",
            "/refresh",
        ].includes(route.path)
    ) {
        item.event = [
            {
                listen: "test",
                script: {
                    type:
                        "text/javascript",
                    exec: [
                        "if (pm.response.code >= 200 && pm.response.code < 300) {",
                        "    const json = pm.response.json();",
                        "    if (json.data?.access_token) pm.collectionVariables.set('access_token', json.data.access_token);",
                        "    if (json.data?.refresh_token) pm.collectionVariables.set('refresh_token', json.data.refresh_token);",
                        "}",
                    ],
                },
            },
        ];
    }

    if (
        prefix === "auth" &&
        route.path === "/logout"
    ) {
        item.event = [
            {
                listen: "test",
                script: {
                    type:
                        "text/javascript",
                    exec: [
                        "if (pm.response.code >= 200 && pm.response.code < 300) {",
                        "    pm.collectionVariables.unset('access_token');",
                        "    pm.collectionVariables.unset('refresh_token');",
                        "}",
                    ],
                },
            },
        ];
    }

    return item;
}

const collection = {
    info: {
        _postman_id:
            "b43196ad-97ae-4c17-8fd1-a6b22461391a",
        name:
            "Workforce Management Backend",
        description:
            "Collection dibuat otomatis dari seluruh route dan validator Joi pada project Workforce Management Backend.",
        schema:
            "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: [],
    event: [
        {
            listen: "test",
            script: {
                type: "text/javascript",
                exec: [
                    "pm.test(\"Response status is valid\", function () {",
                    "    pm.expect(pm.response.code).to.be.within(200, 599);",
                    "});",
                ],
            },
        },
    ],
    variable: [
        {
            key: "base_url",
            value:
                "http://localhost:3001",
            type: "string",
        },
        {
            key: "access_token",
            value: "",
            type: "string",
        },
        {
            key: "refresh_token",
            value: "",
            type: "string",
        },
    ],
    auth: {
        type: "bearer",
        bearer: [
            {
                key: "token",
                value:
                    "{{access_token}}",
                type: "string",
            },
        ],
    },
};

let endpointCount = 0;

for (const [
    moduleName,
    prefix,
] of modules) {
    const moduleDirectory =
        path.join(
            projectRoot,
            "src",
            "modules",
            moduleName
        );
    const routeFile = path.join(
        moduleDirectory,
        "route.js"
    );
    const validatorFile = path.join(
        moduleDirectory,
        "validator.js"
    );

    if (!fs.existsSync(routeFile)) {
        continue;
    }

    const routeSource =
        fs.readFileSync(
            routeFile,
            "utf8"
        );
    const uniqueRoutes =
        new Map();

    for (
        const route of parseRouteSchemas(
            routeSource
        )
    ) {
        const key =
            `${route.method} ${route.path}`;

        if (!uniqueRoutes.has(key)) {
            uniqueRoutes.set(
                key,
                route
            );
        }
    }

    const routes = [
        ...uniqueRoutes.values(),
    ];
    const validator =
        fs.existsSync(
            validatorFile
        )
            ? require(validatorFile)
            : {};

    endpointCount += routes.length;

    collection.item.push({
        name: titleCase(
            moduleName
        ),
        description:
            `Endpoint /api/${prefix}`,
        item: routes.map((route) =>
            createRequest(
                prefix,
                route,
                validator
            )
        ),
    });
}

fs.mkdirSync(
    outputDirectory,
    {
        recursive: true,
    }
);

fs.writeFileSync(
    outputFile,
    `${JSON.stringify(
        collection,
        null,
        2
    )}\n`,
    "utf8"
);

console.log(
    `Postman collection generated: ${outputFile}`
);
console.log(
    `Folders: ${collection.item.length}`
);
console.log(
    `Endpoints: ${endpointCount}`
);
