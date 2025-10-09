package com.ulrich.library2.service;


import com.ulrich.library2.controller.SimpleLoanDTO;
import com.ulrich.library2.entity.loan.Loan;

import java.time.LocalDate;
import java.util.List;

public interface ILoanService {

    public List<Loan> findAllLoansByEndDateBefore(LocalDate maxEndDate);

    public List<Loan> getAllOpenLoansOfThisCustomer(String email, LoanStatus status);

    public Loan getOpenedLoan(SimpleLoanDTO simpleLoanDTO);

    public boolean checkIfLoanExists(SimpleLoanDTO simpleLoanDTO);

    public Loan saveLoan(Loan loan);

    public void closeLoan(Loan loan);


}

