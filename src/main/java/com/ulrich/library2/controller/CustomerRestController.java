package com.ulrich.library2.controller;

import com.ulrich.library2.entity.customer.Customer;
import com.ulrich.library2.service.CustomerServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
// Import nécessaire pour la correction: PageImpl
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.modelmapper.ModelMapper;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/rest/customer/api")
@Tag(name = "Customer API", description = "Contains all operations for managing customers")
public class CustomerRestController {

    public static final Logger LOGGER = LoggerFactory.getLogger(CustomerRestController.class);

    private CustomerServiceImpl customerService;

    private JavaMailSender javaMailSender;

    public CustomerRestController(CustomerServiceImpl customerService, JavaMailSender javaMailSender) {
        this.customerService = customerService;
        this.javaMailSender = javaMailSender;
    }

    /**
     * Ajoute un nouveau client.
     * @param customerDTORequest
     * @return
     */
    @PostMapping("/addCustomer")
    @Operation(
            summary = "Add a new Customer in the Library",
            description = "Creates a new customer if it doesn't already exist."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "409", description = "Conflict: the customer already exist"),
            @ApiResponse(responseCode = "201", description = "Created: the customer is successfully inserted",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomerDTO.class))),
            @ApiResponse(responseCode = "304", description = "Not Modified: the customer is unsuccessfully inserted")
    })
    public ResponseEntity<CustomerDTO> createNewCustomer(@RequestBody @Parameter(description = "Customer data to create") CustomerDTO customerDTORequest) {
        //, UriComponentsBuilder uriComponentBuilder
        Customer existingCustomer = customerService.findCustomerByEmail(customerDTORequest.getEmail());
        if (existingCustomer != null) {
            return new ResponseEntity<CustomerDTO>(HttpStatus.CONFLICT);
        }
        Customer customerRequest = mapCustomerDTOToCustomer(customerDTORequest);
        customerRequest.setCreationDate(LocalDateTime.now());
        Customer customerResponse = customerService.saveCustomer(customerRequest);
        if (customerResponse != null) {
            CustomerDTO customerDTO = mapCustomerToCustomerDTO(customerResponse);
            return new ResponseEntity<CustomerDTO>(customerDTO, HttpStatus.CREATED);
        }
        return new ResponseEntity<CustomerDTO>(HttpStatus.NOT_MODIFIED);
    }

    /**
     * Met à jour les données d'un client.
     * @param customerDTORequest
     * @return
     */
    @PutMapping("/updateCustomer")
    @Operation(
            summary = "Update/Modify an existing customer in the Library",
            description = "Updates an existing customer by ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "404", description = "Not Found : the customer does not exist"),
            @ApiResponse(responseCode = "200", description = "Ok: the customer is successfully updated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomerDTO.class))),
            @ApiResponse(responseCode = "304", description = "Not Modified: the customer is unsuccessfully updated")
    })
    public ResponseEntity<CustomerDTO> updateCustomer(@RequestBody @Parameter(description = "Customer data to update") CustomerDTO customerDTORequest) {
        //, UriComponentsBuilder uriComponentBuilder
        if (!customerService.checkIfIdexists(customerDTORequest.getId())) {
            return new ResponseEntity<CustomerDTO>(HttpStatus.NOT_FOUND);
        }
        Customer customerRequest = mapCustomerDTOToCustomer(customerDTORequest);
        Customer customerResponse = customerService.updateCustomer(customerRequest);
        if (customerResponse != null) {
            CustomerDTO customerDTO = mapCustomerToCustomerDTO(customerResponse);
            return new ResponseEntity<CustomerDTO>(customerDTO, HttpStatus.OK);
        }
        return new ResponseEntity<CustomerDTO>(HttpStatus.NOT_MODIFIED);
    }

    /**
     * Supprime un client.
     * @param customerId
     * @return
     */
    @DeleteMapping("/deleteCustomer/{customerId}")
    @Operation(
            summary = "Delete a customer in the Library",
            description = "Deletes a customer by ID. If the customer does not exist, nothing is done."
    )
    @ApiResponse(responseCode = "204", description = "No Content: customer successfully deleted")
    public ResponseEntity<String> deleteCustomer(@PathVariable @Parameter(description = "ID of the customer to delete") Integer customerId) {
        customerService.deleteCustomer(customerId);
        return new ResponseEntity<String>(HttpStatus.NO_CONTENT);
    }

    /**
     * CORRECTION: La méthode retourne maintenant Page<CustomerDTO> au lieu de List<CustomerDTO>
     * pour que le frontend puisse accéder aux métadonnées de pagination (totalPages, totalElements).
     *
     * @param beginPage
     * @param endPage
     * @return ResponseEntity<Page<CustomerDTO>>
     */
    @GetMapping("/paginatedSearch")
    @Operation(
            summary = "List customers of the Library in a paginated way",
            description = "Retrieves a paginated list of customers."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ok: successfully listed",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomerDTO.class))),
            @ApiResponse(responseCode = "204", description = "No Content: no result found"),
    })
    public ResponseEntity<Page<CustomerDTO>> searchCustomers(
            @RequestParam("beginPage") @Parameter(description = "Beginning page number") int beginPage,
            @RequestParam("endPage") @Parameter(description = "Ending page number") int endPage) {

        // 1. Récupération de la Page<Customer> depuis le service
        Page<Customer> customers = customerService.getPaginatedCustomersList(beginPage, endPage);

        if (customers.getContent().isEmpty()) {
            // Utilise le statut 204 si la liste est vide, mais retourne une Page vide pour maintenir la cohérence
            return new ResponseEntity<>(Page.empty(), HttpStatus.NO_CONTENT);
        }

        // 2. Mapping de List<Customer> vers List<CustomerDTO>
        List<CustomerDTO> customerDTOs = customers.stream()
                .map(this::mapCustomerToCustomerDTO)
                .collect(Collectors.toList());

        // 3. Création de Page<CustomerDTO> à l'aide de PageImpl pour conserver les métadonnées de pagination
        Page<CustomerDTO> customerDTOPage = new PageImpl<>(
                customerDTOs,
                customers.getPageable(),
                customers.getTotalElements()
        );

        return new ResponseEntity<>(customerDTOPage, HttpStatus.OK);
    }

    /**
     * Retourne le client ayant l'adresse email passé en paramètre.
     * @param email
     * @return
     */
    @GetMapping("/searchByEmail")
    @Operation(
            summary = "Search a customer in the Library by its email",
            description = "Finds a customer by email address."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ok: successful research",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomerDTO.class))),
            @ApiResponse(responseCode = "204", description = "No Content: no result found"),
    })
    public ResponseEntity<CustomerDTO> searchCustomerByEmail(@RequestParam("email") @Parameter(description = "Email to search") String email) {
        //, UriComponentsBuilder uriComponentBuilder
        Customer customer = customerService.findCustomerByEmail(email);
        if (customer != null) {
            CustomerDTO customerDTO = mapCustomerToCustomerDTO(customer);
            return new ResponseEntity<CustomerDTO>(customerDTO, HttpStatus.OK);
        }
        return new ResponseEntity<CustomerDTO>(HttpStatus.NO_CONTENT);
    }

    /**
     * Retourne la liste des clients ayant le nom passé en paramètre.
     * @param lastName
     * @return
     */
    @GetMapping("/searchByLastName")
    @Operation(
            summary = "Search customers in the Library by last name",
            description = "Finds customers by last name."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ok: successful research",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomerDTO.class))),
            @ApiResponse(responseCode = "204", description = "No Content: no result found"),
    })
    public ResponseEntity<List<CustomerDTO>> searchBookByLastName(@RequestParam("lastName") @Parameter(description = "Last name to search") String lastName) {
        //, UriComponentsBuilder uriComponentBuilder
        List<Customer> customers = customerService.findCustomerByLastName(lastName);
        if (customers != null && !CollectionUtils.isEmpty(customers)) {
            List<CustomerDTO> customerDTOs = customers.stream().map(customer -> {
                return mapCustomerToCustomerDTO(customer);
            }).collect(Collectors.toList());
            return new ResponseEntity<List<CustomerDTO>>(customerDTOs, HttpStatus.OK);
        }
        return new ResponseEntity<List<CustomerDTO>>(HttpStatus.NO_CONTENT);
    }

    /**
     * Envoi un mail à un client. L'objet MailDTO contient l'identifiant et l'email du client concerné, l'objet du mail et le contenu du message.
     * @param loanMailDto
     * @param uriComponentBuilder
     * @return
     */
    @PutMapping("/sendEmailToCustomer")
    @Operation(
            summary = "Send an email to a customer of the Library",
            description = "Sends an email to a specified customer."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ok: Email successfully sent"),
            @ApiResponse(responseCode = "404", description = "Not Found: no customer found, or wrong email"),
            @ApiResponse(responseCode = "403", description = "Forbidden: Email cannot be sent")
    })
    public ResponseEntity<Boolean> sendMailToCustomer(@RequestBody @Parameter(description = "Mail details") MailDTO loanMailDto, UriComponentsBuilder uriComponentBuilder) {

        Customer customer = customerService.findCustomerById(loanMailDto.getCustomerId());
        if (customer == null) {
            String errorMessage = "The selected Customer for sending email is not found in the database";
            LOGGER.info(errorMessage);
            return new ResponseEntity<Boolean>(false, HttpStatus.NOT_FOUND);
        } else if (customer != null && StringUtils.isEmpty(customer.getEmail())) {
            String errorMessage = "No existing email for the selected Customer for sending email to";
            LOGGER.info(errorMessage);
            return new ResponseEntity<Boolean>(false, HttpStatus.NOT_FOUND);
        }

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(loanMailDto.MAIL_FROM);
        mail.setTo(customer.getEmail());
        mail.setSentDate(new Date());
        mail.setSubject(loanMailDto.getEmailSubject());
        mail.setText(loanMailDto.getEmailContent());

//      try {
//            javaMailSender.send(mail);
//        } catch (MailException e) {
//            return new ResponseEntity<Boolean>(false, HttpStatus.FORBIDDEN);
//        }

        return new ResponseEntity<Boolean>(true, HttpStatus.OK);
    }

    /**
     * Transforme un entity Customer en un POJO CustomerDTO
     *
     * @param customer
     * @return
     */
    private CustomerDTO mapCustomerToCustomerDTO(Customer customer) {
        // ModelMapper est initialisé à chaque appel. Pour une meilleure performance, il serait
        // préférable de l'injecter comme un champ final (private final ModelMapper modelMapper;).
        ModelMapper mapper = new ModelMapper();
        CustomerDTO customerDTO = mapper.map(customer, CustomerDTO.class);
        return customerDTO;
    }

    /**
     * Transforme un POJO CustomerDTO en en entity Customer
     *
     * @param customerDTO
     * @return
     */
    private Customer mapCustomerDTOToCustomer(CustomerDTO customerDTO) {
        // ModelMapper est initialisé à chaque appel.
        ModelMapper mapper = new ModelMapper();
        Customer customer = mapper.map(customerDTO, Customer.class);
        return customer;
    }
}