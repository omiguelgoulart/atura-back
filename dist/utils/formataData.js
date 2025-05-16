"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatarData = formatarData;
const date_fns_tz_1 = require("date-fns-tz");
const locale_1 = require("date-fns/locale");
function formatarData(dataISO) {
    try {
        const data = new Date(dataISO);
        return (0, date_fns_tz_1.format)(data, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: locale_1.ptBR });
    }
    catch (error) {
        console.error("Erro ao formatar a data:", error);
        return "Data inválida";
    }
}
