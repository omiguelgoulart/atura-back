"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarCodigoAleatorio = gerarCodigoAleatorio;
function gerarCodigoAleatorio(tamanho = 5) {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let codigo = "";
    for (let i = 0; i < tamanho; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        codigo += caracteres[indice];
    }
    return codigo;
}
