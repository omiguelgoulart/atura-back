import { formatarData } from "./formataData";

export function mensagemBoasVindas(usuario: any): string {
    let mensagem = "Bem-vindo! ";
    if (usuario.ultimoLogin) {
      mensagem += `Seu último acesso ao sistema foi em ${formatarData(usuario.ultimoLogin).toLocaleString()}`;
    } else {
      mensagem += "Este é o seu primeiro acesso ao sistema.";
    }
    return mensagem;
  }