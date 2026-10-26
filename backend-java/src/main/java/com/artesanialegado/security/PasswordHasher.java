package com.artesanialegado.security;

import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/** Almacenamiento seguro de claves: PBKDF2-HMAC-SHA256 (derivación lenta) con sal aleatoria por usuario. */
public class PasswordHasher {
    private static final String ALG = "PBKDF2WithHmacSHA256";
    private static final int SALT_BYTES = 16;
    private static final int KEY_BITS = 256;
    private final int iteraciones;
    private final SecureRandom random = new SecureRandom();

    public PasswordHasher() { this(210_000); }
    public PasswordHasher(int iteraciones) { this.iteraciones = iteraciones; }

    public String hash(String clave) {
        byte[] sal = new byte[SALT_BYTES];
        random.nextBytes(sal);
        byte[] h = derivar(clave, sal, iteraciones, KEY_BITS);
        return "pbkdf2$" + iteraciones + "$" + Base64.getEncoder().encodeToString(sal) + "$" + Base64.getEncoder().encodeToString(h);
    }

    public boolean verificar(String clave, String guardado) {
        try {
            String[] p = String.valueOf(guardado).split("\\$");
            if (p.length != 4 || !p[0].equals("pbkdf2")) return false;
            byte[] esperado = Base64.getDecoder().decode(p[3]);
            byte[] h = derivar(clave, Base64.getDecoder().decode(p[2]), Integer.parseInt(p[1]), esperado.length * 8);
            return MessageDigest.isEqual(h, esperado);   // comparación en tiempo constante
        } catch (RuntimeException e) {
            return false;
        }
    }

    private static byte[] derivar(String clave, byte[] sal, int iter, int bits) {
        try {
            return SecretKeyFactory.getInstance(ALG).generateSecret(new PBEKeySpec(clave.toCharArray(), sal, iter, bits)).getEncoded();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("PBKDF2 no disponible", e);
        }
    }
}
