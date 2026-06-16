package com.gfg.movieshark.movieshark_master.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Filter to implement API rate limiting using Bucket4j.
 * Limits specific endpoints to 5 requests per minute per identifier (IP or User).
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Map to store buckets per identifier (e.g., Remote IP)
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Create a bucket with 5 tokens that refills 5 tokens every 1 minute
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        
        // Apply rate limit specifically to booking or payment endpoints
        if (path.contains("/ticket/book") || path.contains("/payment/verify")) {
            
            // Key by Remote IP (simplified for demo; could use User Principal for logged-in users)
            String key = request.getRemoteAddr();
            Bucket bucket = buckets.computeIfAbsent(key, k -> createNewBucket());

            if (bucket.tryConsume(1)) {
                // Token consumed, proceed with the request
                filterChain.doFilter(request, response);
            } else {
                // No tokens left, return 429 Too Many Requests
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Too many requests. Please wait 1 minute.\"}");
            }
        } else {
            // Not a restricted endpoint, just proceed
            filterChain.doFilter(request, response);
        }
    }
}
