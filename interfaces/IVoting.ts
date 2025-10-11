export interface IVoting {
  id_voting: number;
  voting_name: string;
  description: string;
  result:
    | string
    | "Programada"
    | "Aprobada"
    | "Denegada"
    | "Sin Decisión"
    | "Activa";
  commission_name: string;
  in_favour: number;
  against: number;
  abstention: number;
  totalVotes: number;
  state: "Abierta" | "Cerrada" | string;
  totalParticipants: number;
  date?: Date | string;
  hour?: string;
}
