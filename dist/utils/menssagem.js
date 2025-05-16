"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mensagemBoasVindas = mensagemBoasVindas;
const formataData_1 = require("./formataData");
function mensagemBoasVindas(usuario) {
    let mensagem = "Bem-vindo! ";
    if (usuario.ultimoLogin) {
        mensagem += `Seu último acesso ao sistema foi em ${(0, formataData_1.formatarData)(usuario.ultimoLogin).toLocaleString()}`;
    }
    else {
        mensagem += "Este é o seu primeiro acesso ao sistema.";
    }
    return mensagem;
}
