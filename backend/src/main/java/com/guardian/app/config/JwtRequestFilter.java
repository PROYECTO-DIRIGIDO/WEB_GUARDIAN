package com.guardian.app.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

/**
 * Filtro de autenticación stateless que procesa el token Bearer en cada petición entrante.
 * Anotado como @Component para gestión de ciclo de vida e inyección de dependencias por Spring.
 */
@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            try {
                String fullToken = token.substring(7); // Extrae "username:ROLE:timestamp"
                String[] parts = fullToken.split(":");
                if (parts.length >= 2) {
                    String username = parts[0];
                    String role = parts[1].startsWith("ROLE_") ? parts[1] : "ROLE_" + parts[1];
                    
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            username, null, Collections.singletonList(new SimpleGrantedAuthority(role)));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                // Token malformado, ignorar y continuar la cadena
            }
        }
        chain.doFilter(request, response);
    }
}
