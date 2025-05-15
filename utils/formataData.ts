import {format}  from "date-fns-tz";
import { ptBR } from "date-fns/locale";

export function formatarData(dataISO: string): string {
  try {
    const data = new Date(dataISO);
    return format(data, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar a data:", error);
    return "Data inválida";
  }
}


