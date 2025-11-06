

package com.ulrich.library2.controller;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;

@Schema(name = "Simple Loan Model", description = "Represents a simplified loan model")
public class SimpleLoanDTO {

    @Schema(description = "Book id concerned by the loan")
    private Integer bookId;

    @Schema(description = "Customer id concerned by the loan")
    private Integer customerId;

    @Schema(description = "Loan beginning date")
    private LocalDate beginDate;

    @Schema(description = "Loan ending date")
    private LocalDate endDate;

    public Integer getBookId() {
        return bookId;
    }

    public void setBookId(Integer bookId) {
        this.bookId = bookId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public LocalDate getBeginDate() {
        return beginDate;
    }

    public void setBeginDate(LocalDate beginDate) {
        this.beginDate = beginDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}