export function validaSenha(senha: string): string[] {
    const mensagens: string[] = [];
  
    if (senha.length < 6) {
      mensagens.push("Senha deve ter no mínimo 6 caracteres");
    }
  
    let minusc = 0;
    let maiusc = 0;
    let num = 0;
    let simb = 0;
  
    for (const letra of senha) {
      if (/[a-z]/.test(letra)) {
        minusc++;
      } else if (/[A-Z]/.test(letra)) {
        maiusc++;
      } else if (/[0-9]/.test(letra)) {
        num++;
      } else {
        simb++;
      }
    }
  
    if (minusc === 0) {
      mensagens.push("Senha deve ter no mínimo uma letra minúscula");
    }
    if (maiusc === 0) {
      mensagens.push("Senha deve ter no mínimo uma letra maiúscula");
    }
    if (num === 0) {
      mensagens.push("Senha deve ter no mínimo um número");
    }
    if (simb === 0) {
      mensagens.push("Senha deve ter no mínimo um símbolo");
    }
  
    return mensagens;
  }
  