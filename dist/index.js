"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const produtos_1 = __importDefault(require("./routes/produtos"));
const marcas_1 = __importDefault(require("./routes/marcas"));
const fotos_1 = __importDefault(require("./routes/fotos"));
const pedidos_1 = __importDefault(require("./routes/pedidos"));
const avaliacoes_1 = __importDefault(require("./routes/avaliacoes"));
const carrinho_1 = __importDefault(require("./routes/carrinho"));
const itensPedido_1 = __importDefault(require("./routes/itensPedido"));
const endereco_1 = __importDefault(require("./routes/endereco"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const login_1 = __importDefault(require("./routes/login"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3001;
app.use(express_1.default.json());
app.use((0, express_fileupload_1.default)({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.use((0, cors_1.default)());
app.use('/avaliacoes', avaliacoes_1.default);
app.use('/carrinho', carrinho_1.default);
app.use('/clientes', clientes_1.default);
app.use('/enderecos', endereco_1.default);
app.use('/fotos', fotos_1.default);
app.use('/itemPedido', itensPedido_1.default);
app.use('/login', login_1.default);
app.use('/marcas', marcas_1.default);
app.use('/pedidos', pedidos_1.default);
app.use('/produtos', produtos_1.default);
app.get('/', (req, res) => {
    res.send('API: Perfumaria');
});
app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);
});
