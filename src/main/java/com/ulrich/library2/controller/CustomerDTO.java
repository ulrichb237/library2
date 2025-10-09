package com.ulrich.library2.controller;


import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Customer Model")
public class CustomerDTO implements Comparable<CustomerDTO>{

    @Schema(description= "Customer id")
    private Integer id;

    @Schema(description = "Customer first name")
    private String firstName;

    @Schema(description = "Customer last name")
    private String lastName;

    @Schema(description = "Customer job")
    private String job;

    @Schema(description = "Customer address")
    private String address;

    @Schema(description = "Customer email")
    private String email;

    @Schema(description= "Customer creation date in the system")
    private LocalDateTime creationDate;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getJob() {
        return job;
    }

    public void setJob(String job) {
        this.job = job;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    @Override
    public int compareTo(CustomerDTO o) {
        return this.lastName.compareToIgnoreCase(o.getLastName());
    }

}

