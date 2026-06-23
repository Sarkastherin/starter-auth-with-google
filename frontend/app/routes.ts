import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Ruta raíz (Landing Page pública, accesible para todos)
  index("routes/home.tsx"),

  // 🔓 Bloque de Rutas Públicas (Redirigen al dashboard si ya iniciaste sesión)
  layout("layouts/PublicRoute.tsx", [
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("forgot-password", "routes/forgot-password.tsx"),
    route("reset-password", "routes/reset-password.tsx"),
  ]),

  // 🔒 Bloque de Rutas Privadas (Redirigen al login si no estás autenticado)
  layout("layouts/ProtectedRoute.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("verify-email", "routes/verify-email.tsx")
  ]),
] satisfies RouteConfig;