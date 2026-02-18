package mk.ukim.finki.timski.coudy.web.filters;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import mk.ukim.finki.timski.coudy.constants.JwtConstants;
import mk.ukim.finki.timski.coudy.helpers.JwtHelper;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.service.domain.UserService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Set<String> PUBLIC_API_PATHS = Set.of(
            "/api/user/login",
            "/api/user/register",
            "/api/user/logout"
    );

    private final JwtHelper jwtHelper;
    private final UserService userService;

    public JwtFilter(JwtHelper jwtHelper, UserService userService) {
        this.jwtHelper = jwtHelper;
        this.userService = userService;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath();
        return PUBLIC_API_PATHS.contains(path);
    }

    private boolean isProtectedApiPath(String path) {
        return path.startsWith("/api/");
    }

    private void sendUnauthorized(@NonNull HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + (message != null ? message : "Invalid or missing token") + "\"}");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getServletPath();
        String headerValue = request.getHeader(JwtConstants.HEADER);

        // Protected API requires Bearer token
        if (isProtectedApiPath(path)) {
            if (headerValue == null || !headerValue.startsWith(JwtConstants.TOKEN_PREFIX)) {
                sendUnauthorized(response, "Missing or invalid Authorization header. Use: Authorization: Bearer <token>");
                return;
            }

            String token = headerValue.substring(JwtConstants.TOKEN_PREFIX.length()).trim();
            if (token.isEmpty()) {
                sendUnauthorized(response, "Empty token");
                return;
            }

            try {
                String username = jwtHelper.extractUsername(token);
                if (username == null || username.isBlank()) {
                    sendUnauthorized(response, "Invalid token");
                    return;
                }

                User user = userService.findByUsername(username);
                if (!jwtHelper.isValid(token, user)) {
                    sendUnauthorized(response, "Token expired or invalid");
                    return;
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } catch (JwtException e) {
                sendUnauthorized(response, "Invalid or expired token");
                return;
            } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
                sendUnauthorized(response, "User not found");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
