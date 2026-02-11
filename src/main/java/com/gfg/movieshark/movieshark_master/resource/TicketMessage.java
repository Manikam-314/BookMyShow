package com.gfg.movieshark.movieshark_master.resource;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketMessage {

    private String email;
    private String mobile;
    private String show;
    private String seats;

}
