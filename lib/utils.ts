import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { io, Socket } from "socket.io-client";
import { IUser } from "@/interfaces/IUser";
import { IFormData } from "@/interfaces/IFormData";
import { IVoting } from "@/interfaces/IVoting";
import { Dispatch } from "react";
import { ICommission } from "@/interfaces/ICommission";

declare global {
  interface Window {
    __socket?: Socket;
    __socketFlag?: boolean;
    __user?: IUser;
  }

  interface IExtandar {
    id: number;
    name: string;
  }
}

// Initialize user object without useState
let __user: IUser = {
  name: {
    first_name: "",
    second_name: "",
    first_surname: "",
    second_surname: "",
    name: "",
  },
  email: "",
  userName: "",
  country: {
    id: 0,
    name: "",
  },
  role: {
    id: 0,
    name: "",
  },
  status: "Activo",
  code_access: "",
  date_expired: "",
  date_register: "",
};

let __voting: IVoting = {
  id_voting: 0,
  voting_name: "",
  description: "",
  result: "",
  commission_name: "",
  in_favour: 0,
  against: 0,
  abstention: 0,
  totalVotes: 0,
  state: "",
  totalParticipants: 0,
};

let __formData: IFormData = {
  first_name: "",
  second_name: "",
  first_surname: "",
  second_surname: "",
  email: "",
  userName: "",
  country: "",
  role: "",
};

let __roles: IExtandar[] = [];
let __countries: IExtandar[] = [];
let __commission: ICommission[] = [];
// Closure para encapsular las variables
const authStore = (() => {
  // Variables privadas

  return {
    getIdentity: () => {
      if (typeof window !== "undefined") {
        return sessionStorage.getItem("identity");
      }
      return null;
    },
    getToken: () => {
      if (typeof window !== "undefined") {
        return sessionStorage.getItem("token");
      }
      return null;
    },
    getStorageUsername: () => {
      if (typeof window !== "undefined") {
        return sessionStorage.getItem("username");
      }
      return null;
    },
    getIsAuthenticated: () => {
      if (typeof window !== "undefined") {
        return sessionStorage.getItem("authenticated");
      }
      return null;
    },
  };
})();

// Exportamos las funciones de acceso

export const getIdentity = authStore.getIdentity;
export const getToken = authStore.getToken;
export const getStorageUsername = authStore.getStorageUsername;
export const getIsAuthenticated = authStore.getIsAuthenticated;

// Function to update user
export const prepareAuxUser = (user: IUser) => {
  __user = user;
  return __user;
};

export const prepareAuxRole = (role: IExtandar[]) => {
  __roles = role;
  return __roles;
};

export const prepareAuxCountry = (country: IExtandar[]) => {
  __countries = country;
  return __countries;
};

// Function to update voting
export const prepareAuxVoting = (voting: IVoting) => {
  __voting = voting;
  return __voting;
};

export const prepareAuxCommission = (commission: ICommission[]) => {
  __commission = commission;
  return __commission;
};

// Function to get current user
export const getAuxUser = (): IUser => __user;
export const getAuxRoles = (): IExtandar[] => __roles;
export const getAuxCountries = (): IExtandar[] => __countries;
export const getAuxVoting = (): IVoting => __voting;
export const getAuxCommission = (): ICommission[] => __commission;

// Cambiamos a un array de listeners para soportar múltiples componentes
const monitorDataListeners: ((data: any) => void)[] = [];

export const getSocket = (setMonitorData?: Dispatch<any>) => {
  if (typeof window !== "undefined" && window.__socket) {
    // Si se proporciona un nuevo listener, lo añadimos
    if (setMonitorData && typeof setMonitorData === "function") {
      monitorDataListeners.push(setMonitorData);
    }
    return window.__socket;
  }

  if (typeof window !== "undefined") {
    const newSocket = io("https://isriproject-backend.onrender.com");
    //const newSocket = io("localhost:3001");

    newSocket.on("your-identity", (identity) => {
      if (sessionStorage.getItem("identity") && !window.__socketFlag) {
        newSocket.emit("reassign-identity", {
          identity: sessionStorage.getItem("identity"),
        });
        window.__socketFlag = true;
      } else if (!sessionStorage.getItem("identity")) {
        sessionStorage.setItem("identity", identity);
      }
    });

    // Configuramos el listener una sola vez
    newSocket.on("executed-votes", (res: any) => {
      // Notificamos a todos los listeners registrados

      monitorDataListeners.forEach((listener) => {
        if (typeof listener === "function") {
          listener(res);
        }
      });
    });

    // Añadimos el listener inicial si existe
    if (setMonitorData && typeof setMonitorData === "function") {
      monitorDataListeners.push(setMonitorData);
    }

    window.__socket = newSocket;
    return newSocket;
  }

  return {} as Socket;
};

export const socket = getSocket();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
