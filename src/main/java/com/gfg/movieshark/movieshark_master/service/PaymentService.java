package com.gfg.movieshark.movieshark_master.service;

import com.gfg.movieshark.movieshark_master.resource.PaymentResponse;
import com.gfg.movieshark.movieshark_master.resource.PaymentVerificationRequest;
import com.gfg.movieshark.movieshark_master.resource.TicketResource;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final TicketService ticketService;

    public PaymentResponse createOrder(double amount) throws RazorpayException {
        if ("rzp_test_mock_key_id".equals(razorpayKeyId) || "YOUR_REAL_SECRET_HERE".equals(razorpayKeySecret)) {
            log.info("USING MOCK RAZORPAY MODE (Placeholder secret detected) for amount: {}", amount);
            return PaymentResponse.builder()
                    .orderId("order_mock_" + System.currentTimeMillis())
                    .amount(amount)
                    .currency("INR")
                    .razorpayKeyId(razorpayKeyId)
                    .build();
        }

        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        
        JSONObject orderRequest = new JSONObject();
        // amount in paise (multiply by 100)
        orderRequest.put("amount", (int) (amount * 100)); 
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = razorpay.orders.create(orderRequest);

        return PaymentResponse.builder()
                .orderId(order.get("id"))
                .amount(amount)
                .currency("INR")
                .razorpayKeyId(razorpayKeyId)
                .build();
    }

    public TicketResource verifyPaymentAndBook(PaymentVerificationRequest request) throws Exception {
        // Mock Mode: Bypass signature check for testing/demo or if placeholder secret is used
        if ("rzp_test_mock_key_id".equals(razorpayKeyId) || "YOUR_REAL_SECRET_HERE".equals(razorpayKeySecret)) {
            log.info("MOCK PAYMENT VERIFIED Order ID: {}", request.getRazorpayOrderId());
            return ticketService.bookTicket(request.getBookingResource());
        }

        // Step 1: Verify HMAC signature
        String generatedSignature = generateHMAC(
                request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId(),
                razorpayKeySecret
        );

        if (!generatedSignature.equals(request.getRazorpaySignature())) {
            throw new RuntimeException("Payment Signature Verification Failed");
        }

        log.info("Payment Verification successful for Order ID: {}", request.getRazorpayOrderId());

        // Step 2: Book Ticket
        if (request.getBookingResource() == null) {
            throw new IllegalArgumentException("Booking details are missing");
        }
        
        return ticketService.bookTicket(request.getBookingResource());
    }

    private String generateHMAC(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] hmacData = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hmacData) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
