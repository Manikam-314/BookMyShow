package com.gfg.movieshark.movieshark_master.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final Random random = new Random();
    private static final int OTP_EXPIRY_MINUTES = 5;

    public String generateOtp(String email) {
        String otp = String.format("%06d", random.nextInt(1000000));
        otpStorage.put(email, new OtpData(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        OtpData data = otpStorage.get(email);
        if (data == null) {
            return false;
        }

        if (data.expiryTime.isBefore(LocalDateTime.now())) {
            otpStorage.remove(email);
            return false;
        }

        boolean isValid = data.otp.equals(otp);
        if (isValid) {
            otpStorage.remove(email);
        }
        return isValid;
    }

    public void clearOtp(String email) {
        otpStorage.remove(email);
    }

    private static class OtpData {
        private final String otp;
        private final LocalDateTime expiryTime;

        public OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}
