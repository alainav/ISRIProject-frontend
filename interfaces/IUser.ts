export interface IUser {
  email: string;
  userName: string;
  name: {
    first_name: string;
    second_name: string | null;
    first_surname: string;
    second_surname: string;
    name: string;
  };
  date_register: string;
  date_expired: string;
  country: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    name: string;
  };
  status: "Activo" | "Desactivado" | string;
  code_access: string;
}
