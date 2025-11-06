

package com.ulrich.library2.controller;

import com.ulrich.library2.entity.book.Book;
import com.ulrich.library2.entity.customer.Customer;
import com.ulrich.library2.entity.loan.Loan;
import com.ulrich.library2.service.LoanId;
import com.ulrich.library2.service.LoanServiceImpl;
import com.ulrich.library2.service.LoanStatus;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/rest/loan/api")
@Tag(name = "Loan Rest Controller", description = "Contains all operations for managing loans")
public class LoanRestController {

    public static final Logger LOGGER = LoggerFactory.getLogger(LoanRestController.class);

    private LoanServiceImpl loanService;

    public LoanRestController(LoanServiceImpl loanService) {
        this.loanService = loanService;
    }

    @GetMapping("/maxEndDate")
    @Operation(summary = "List loans realized before the indicated date")
    @ApiResponse(responseCode = "200", description = "Ok: successfully listed")
    public ResponseEntity<List<LoanDTO>> searchAllBooksLoanBeforeThisDate(@RequestParam("date") String maxEndDateStr) {
        List<Loan> loans = loanService.findAllLoansByEndDateBefore(LocalDate.parse(maxEndDateStr));
        loans.removeAll(Collections.singleton(null));
        List<LoanDTO> loanInfosDtos = mapLoanDtosFromLoans(loans);
        return new ResponseEntity<List<LoanDTO>>(loanInfosDtos, HttpStatus.OK);
    }

    @GetMapping("/customerLoans")
    @Operation(summary = "List loans realized before the indicated date")
    @ApiResponse(responseCode = "200", description = "Ok: successfully listed")
    public ResponseEntity<List<LoanDTO>> searchAllOpenedLoansOfThisCustomer(@RequestParam("email") String email) {
        List<Loan> loans = loanService.getAllOpenLoansOfThisCustomer(email, LoanStatus.OPEN);
        loans.removeAll(Collections.singleton(null));
        List<LoanDTO> loanInfosDtos = mapLoanDtosFromLoans(loans);
        return new ResponseEntity<List<LoanDTO>>(loanInfosDtos, HttpStatus.OK);
    }

    @PostMapping("/addLoan")
    @Operation(summary = "Add a new Loan in the Library")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "409", description = "Conflict: the loan already exists"),
            @ApiResponse(responseCode = "201", description = "Created: the loan is successfully inserted"),
            @ApiResponse(responseCode = "304", description = "Not Modified: the loan is unsuccessfully inserted")
    })
    public ResponseEntity<Boolean> createNewLoan(@RequestBody SimpleLoanDTO simpleLoanDTORequest,
                                                 UriComponentsBuilder uriComponentBuilder) {
        boolean isLoanExists = loanService.checkIfLoanExists(simpleLoanDTORequest);
        if (isLoanExists) {
            return new ResponseEntity<Boolean>(false, HttpStatus.CONFLICT);
        }
        Loan loanRequest = mapSimpleLoanDTOToLoan(simpleLoanDTORequest);
        Loan loan = loanService.saveLoan(loanRequest);
        if (loan != null) {
            return new ResponseEntity<Boolean>(true, HttpStatus.CREATED);
        }
        return new ResponseEntity<Boolean>(false, HttpStatus.NOT_MODIFIED);
    }

    @PostMapping("/closeLoan")
    @Operation(summary = "Marks as close a Loan in the Library")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "No Content: no loan found"),
            @ApiResponse(responseCode = "200", description = "Ok: the loan is successfully closed"),
            @ApiResponse(responseCode = "304", description = "Not Modified: the loan is unsuccessfully closed")
    })
    public ResponseEntity<Boolean> closeLoan(@RequestBody SimpleLoanDTO simpleLoanDTORequest,
                                             UriComponentsBuilder uriComponentBuilder) {
        Loan existingLoan = loanService.getOpenedLoan(simpleLoanDTORequest);
        if (existingLoan == null) {
            return new ResponseEntity<Boolean>(false, HttpStatus.NO_CONTENT);
        }
        existingLoan.setStatus(LoanStatus.CLOSE);
        Loan loan = loanService.saveLoan(existingLoan);
        if (loan != null) {
            return new ResponseEntity<Boolean>(true, HttpStatus.OK);
        }
        return new ResponseEntity<Boolean>(false, HttpStatus.NOT_MODIFIED);
    }

    private List<LoanDTO> mapLoanDtosFromLoans(List<Loan> loans) {
        Function<Loan, LoanDTO> mapperFunction = (loan) -> {
            LoanDTO loanDTO = new LoanDTO();
            loanDTO.getBookDTO().setId(loan.getPk().getBook().getId());
            loanDTO.getBookDTO().setIsbn(loan.getPk().getBook().getIsbn());
            loanDTO.getBookDTO().setTitle(loan.getPk().getBook().getTitle());
            loanDTO.getCustomerDTO().setId(loan.getPk().getCustomer().getId());
            loanDTO.getCustomerDTO().setFirstName(loan.getPk().getCustomer().getFirstName());
            loanDTO.getCustomerDTO().setLastName(loan.getPk().getCustomer().getLastName());
            loanDTO.getCustomerDTO().setEmail(loan.getPk().getCustomer().getEmail());
            loanDTO.setLoanBeginDate(loan.getBeginDate());
            loanDTO.setLoanEndDate(loan.getEndDate());
            return loanDTO;
        };
        if (!CollectionUtils.isEmpty(loans)) {
            return loans.stream().map(mapperFunction).sorted().collect(Collectors.toList());
        }
        return null;
    }

    private Loan mapSimpleLoanDTOToLoan(SimpleLoanDTO simpleLoanDTO) {
        Loan loan = new Loan();
        Book book = new Book();
        book.setId(simpleLoanDTO.getBookId());
        Customer customer = new Customer();
        customer.setId(simpleLoanDTO.getCustomerId());
        LoanId loanId = new LoanId(book, customer);
        loan.setPk(loanId);
        loan.setBeginDate(simpleLoanDTO.getBeginDate());
        loan.setEndDate(simpleLoanDTO.getEndDate());
        loan.setStatus(LoanStatus.OPEN);
        return loan;
    }
}


