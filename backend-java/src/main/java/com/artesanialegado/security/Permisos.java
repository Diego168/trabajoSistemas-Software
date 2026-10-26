package com.artesanialegado.security;

/** Autorización por rol (RBAC). ADMIN: todo. OPERADOR: leer y registrar, sin borrar ni importar. CONSULTA: solo lectura. */
public final class Permisos {
    private Permisos() { }

    public static boolean permitido(String rol, String metodo, String ruta) {
        if (rol == null) return false;
        return switch (rol) {
            case "ADMIN" -> true;
            case "OPERADOR" -> !"DELETE".equals(metodo) && !ruta.startsWith("/api/import/");
            case "CONSULTA" -> "GET".equals(metodo);
            default -> false;
        };
    }
}
