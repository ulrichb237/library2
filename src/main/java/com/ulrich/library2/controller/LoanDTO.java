package com.ulrich.library2.controller;


import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Loan Model")
public class LoanDTO implements Comparable<LoanDTO> {

    @Schema(description = "Book concerned by the loan")
    private BookDTO bookDTO = new BookDTO();

    @Schema(description = "Customer concerned by the loan")
    private CustomerDTO customerDTO = new CustomerDTO();

    @Schema(description = "Loan begining date")
    private LocalDate loanBeginDate;

    @Schema(description= "Loan ending date")
    private LocalDate loanEndDate;

    public LocalDate getLoanBeginDate() {
        return loanBeginDate;
    }

    public void setLoanBeginDate(LocalDate loanBeginDate) {
        this.loanBeginDate = loanBeginDate;
    }

    public LocalDate getLoanEndDate() {
        return loanEndDate;
    }

    public void setLoanEndDate(LocalDate loanEndDate) {
        this.loanEndDate = loanEndDate;
    }

    public BookDTO getBookDTO() {
        return bookDTO;
    }

    public void setBookDTO(BookDTO bookDTO) {
        this.bookDTO = bookDTO;
    }

    public CustomerDTO getCustomerDTO() {
        return customerDTO;
    }

    public void setCustomerDTO(CustomerDTO customerDTO) {
        this.customerDTO = customerDTO;
    }

    @Override
    public int compareTo(LoanDTO o) {
        // ordre decroissant
        return o.getLoanBeginDate().compareTo(this.loanBeginDate);
    }

}

