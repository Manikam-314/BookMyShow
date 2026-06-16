package com.gfg.movieshark.movieshark_master.repository;

import com.gfg.movieshark.movieshark_master.domain.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByCreatedAtDesc();

    List<AuditLog> findByTargetIdAndTargetType(Long targetId, String targetType);
}
