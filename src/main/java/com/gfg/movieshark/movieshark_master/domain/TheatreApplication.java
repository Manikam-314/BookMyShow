package com.gfg.movieshark.movieshark_master.domain;

import com.gfg.movieshark.movieshark_master.enums.TheatreStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "theatre_applications")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TheatreApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "theatre_name", nullable = false)
    private String theatreName;

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "screens_count", nullable = false)
    private Integer screensCount;

    @Column(name = "verification_doc_url", length = 1000)
    private String verificationDocUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TheatreStatus status = TheatreStatus.PENDING;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private User owner;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
