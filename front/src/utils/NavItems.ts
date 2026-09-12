import { PATHROUTES } from "./PathRoutes";

export const NavItems = [
  // --- RUTAS PÚBLICAS (Todos las ven) ---
  {
    id: 1,
    nameToRender: "Inicio",
    route: PATHROUTES.LANDING,
    roles: ["visitante", "inquilino", "admin"],
  },
  {
    id: 2,
    nameToRender: "Explorar Propiedades",
    route: PATHROUTES.HOME,
    roles: ["visitante", "inquilino", "admin"],
  },

  // --- RUTAS EXCLUSIVAS DEL INQUILINO (Usuario Registrado) ---
  {
    id: 3,
    nameToRender: "Mis Favoritos",
    route: PATHROUTES.FAVORITES,
    roles: ["inquilino"], // El Admin no necesita favoritos de alquiler, tiene su panel
  },
  {
    id: 4,
    nameToRender: "Mis Alquileres", // Aquí ve sus visitas agendadas, señas y chatbot
    route: PATHROUTES.MY_RENTALS,
    roles: ["inquilino"],
  },

  // --- RUTA EXCLUSIVA DEL ADMINISTRADOR ---
  {
    id: 5,
    nameToRender: "Panel de Gestión", // Centraliza Métricas, CRUD, Reservas y Visitas
    route: PATHROUTES.DASHBOARD,
    roles: ["admin"],
  },
];
