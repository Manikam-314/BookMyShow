package com.gfg.movieshark.movieshark_master.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gfg.movieshark.movieshark_master.resource.TicketMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSenderImpl javaMailSender;
    private final ObjectMapper mapper = new ObjectMapper();


    public void sendNotification(TicketMessage message) {
        try {
            sendEmailToUser(message);
        } catch (Exception e) {
            log.error("Failed to send email notification", e);
        }
        try {
            sendSMSToUser(message);
        } catch (Exception e) {
            log.error("Failed to send SMS notification", e);
        }
    }

    private void sendSMSToUser(TicketMessage message) {
        log.info("calling sms service for showDetails: {}  seatDetails : {}to number {}", message.getShow(), message.getSeats(), message.getMobile());

    }

    private void sendEmailToUser(TicketMessage message) throws JsonProcessingException {
        log.info("calling email service for showDetails: {}  seatDetails : {}to number {}", message.getShow(), message.getSeats(), message.getEmail());

        SimpleMailMessage mailMessage=new SimpleMailMessage();
        mailMessage.setTo(message.getEmail());
        mailMessage.setSubject("MovieShark Tickets");
        mailMessage.setText("Show: "+message.getShow()+" Tickets: "+message.getSeats());

        log.info(mapper.writeValueAsString(mailMessage));


        javaMailSender.send(mailMessage);


    }

    public void sendOtpEmail(String email, String otp) {
        log.info("Sending OTP {} to email {}", otp, email);

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(email);
        mailMessage.setSubject("MovieShark - Email Verification OTP");
        mailMessage.setText("Your OTP for MovieShark registration is: " + otp + 
                           "\nThis OTP is valid for 5 minutes.");

        try {
            log.info(mapper.writeValueAsString(mailMessage));
            javaMailSender.send(mailMessage);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", email, e);
        }
    }

}
