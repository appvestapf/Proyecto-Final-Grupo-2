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
    roles: ["visitante", "inquilino",],
  },

  // --- RUTAS EXCLUSIVAS DEL INQUILINO (Usuario Registrado) ---
  {
    id: 3,
    nameToRender: "Mi Perfil",
    route: PATHROUTES.PROFILE,
    roles: ["inquilino"], // El Admin no necesita datos de alquiler, tiene su panel
  },

  // --- RUTA EXCLUSIVA DEL ADMINISTRADOR ---
  {
    id: 4,
    nameToRender: "Panel de Gestión", // Centraliza Métricas, CRUD, Reservas y Visitas
    route: PATHROUTES.DASHBOARD,
    roles: ["admin"],
  },
];
