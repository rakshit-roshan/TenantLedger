package in.gharkhata.dto;

import in.gharkhata.model.Organization;
import in.gharkhata.model.User;

public class AuthResponse {
    public String token;
    public User user;
    public String role;
    public Organization organization;

    public AuthResponse(String token, User user, String role, Organization organization) {
        this.token = token;
        this.user = user;
        this.role = role;
        this.organization = organization;
    }
}

