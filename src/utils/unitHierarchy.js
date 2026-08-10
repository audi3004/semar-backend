const { Unit } = require("../models");

async function loadActiveUnits() {
    return Unit.findAll({
        where: { is_active: "Y" },
        attributes: ["id_unit", "id_induk_unit"],
        raw: true,
    });
}

async function getSelfAndDescendantIds(idUnit) {
    const units = await loadActiveUnits();
    const children = new Map();
    for (const unit of units) {
        const parent = unit.id_induk_unit == null ? null : Number(unit.id_induk_unit);
        if (!children.has(parent)) children.set(parent, []);
        children.get(parent).push(Number(unit.id_unit));
    }

    const result = [];
    const queue = [Number(idUnit)];
    const visited = new Set();
    while (queue.length) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        result.push(current);
        queue.push(...(children.get(current) || []));
    }
    return result;
}

async function getSelfAndAncestorIds(idUnit) {
    const units = await loadActiveUnits();
    const parents = new Map(units.map((unit) => [
        Number(unit.id_unit),
        unit.id_induk_unit == null ? null : Number(unit.id_induk_unit),
    ]));
    const result = [];
    const visited = new Set();
    let current = Number(idUnit);
    while (current && !visited.has(current)) {
        visited.add(current);
        result.push(current);
        current = parents.get(current);
    }
    return result;
}

module.exports = { getSelfAndDescendantIds, getSelfAndAncestorIds };
