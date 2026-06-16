package com.gfg.movieshark.movieshark_master.domain;

import com.gfg.movieshark.movieshark_master.enums.Role;
import com.gfg.movieshark.movieshark_master.resource.UserResource;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Entity
@Table(name = "users")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class User implements UserDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "password", nullable = false)
	private String password;

	@Column(name = "mobile", nullable = false)
	private String mobile;

	@Column(name = "email", nullable = false)
	private String email;

	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
	@ToString.Exclude
	private List<Ticket> ticketEntities;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", columnDefinition = "varchar(30) default 'USER'")
	private Role role;

	public static User toEntity(UserResource userResource) {
		return User.builder()
				.name(userResource.getName())
				.password(userResource.getPassword())
				.role(userResource.getRole())
				.mobile(userResource.getMobile())
				.email(userResource.getEmail())
				.build(); // ❌ REMOVE .id()

	}

	public static UserResource toResource(User user) {

		return UserResource.builder()
				.id(user.getId())
				.name(user.getName())
				.mobile(user.getMobile())
				.email(user.getEmail())
				.role(user.getRole())
				.tickets(Ticket.toResource(user.getTicketEntities()))
				.build();
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		if (this.role == null) {
			return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
		}
		return Arrays.stream(this.role.toString().split(","))
				.map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim()))
				.collect(Collectors.toList());
	}

	// ✅ ADD THIS METHOD (MANDATORY)
	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return email; // JWT subject must be the email — JwtAuthService looks up by email
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}
