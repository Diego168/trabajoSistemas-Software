package com.artesanialegado.domain;

import com.google.common.collect.ImmutableList;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

/** Regla de negocio: cada técnica solo pasa por las etapas de su propio proceso (principio abierto/cerrado). */
public final class Etapas {
    public static final List<String> TODAS = ImmutableList.of("MODELADO", "SECADO", "COCCION", "TALLADO", "TEJIDO", "ACABADO");
    private static final List<String> CERAMICA = ImmutableList.of("MODELADO", "SECADO", "COCCION", "ACABADO");
    private static final List<String> EBANISTERIA = ImmutableList.of("MODELADO", "TALLADO", "ACABADO");
    private static final List<String> TEJIDOS = ImmutableList.of("TEJIDO", "ACABADO");

    private Etapas() { }

    public static List<String> deTaller(String tecnica) {
        String t = sinTildes(tecnica);
        if (t.matches(".*(alfar|ceram).*")) return CERAMICA;
        if (t.matches(".*(ebanis|tallad|mueb|madera).*")) return EBANISTERIA;
        if (t.matches(".*(tej|hilad).*")) return TEJIDOS;
        return TODAS;
    }

    static String sinTildes(String s) {
        if (s == null) return "";
        return Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
    }
}
