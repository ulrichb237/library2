


package com.ulrich.library2.controller;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Mail Model", description = "Represents an email to be sent to a customer")
public class MailDTO {

    @Schema(description = "Mail sender address")
    public final String MAIL_FROM = "noreply.library.test@gmail.com";

    @Schema(description = "Customer receiver id")
    private Integer customerId;

    @Schema(description = "Email subject")
    private String emailSubject;

    @Schema(description = "Email content")
    private String emailContent;

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getEmailContent() {
        return emailContent;
    }

    public void setEmailContent(String emailContent) {
        this.emailContent = emailContent;
    }

    public String getEmailSubject() {
        return emailSubject;
    }

    public void setEmailSubject(String emailSubject) {
        this.emailSubject = emailSubject;
    }
}