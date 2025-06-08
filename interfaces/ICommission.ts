import { ICountries } from "./ICountries";

export interface ICommission {
  id_commission: number;
  name: string;
  president: string;
  presidentUserName: string;
  secretary: string;
  secretaryUserName: string;
  votes: number;
  edition: string;
  numOfCountries: number;
  totalCountries: number;
  countries: ICountries[];
}
