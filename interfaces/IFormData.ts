export interface IFormData {
  identity?: string | number | null;
  token?: string | number | null;
  first_name: string;
  second_name?: string | null;
  first_surname: string;
  second_surname: string;
  email: string;
  userName: string;
  country: string;
  role: string;
  date_register?: string;
  date_expired?: string;
}
