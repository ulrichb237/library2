
package com.ulrich.library2.controller;

import com.ulrich.library2.entity.book.Book;
import com.ulrich.library2.entity.category.Category;
import com.ulrich.library2.service.BookServiceImpl;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;

@RestController
@RequestMapping("/rest/book/api")
@Tag(name = "Book Rest Controller", description = "Contains all operations for managing books")
public class BookRestController {

    public static final Logger LOGGER = LoggerFactory.getLogger(BookRestController.class);

    private BookServiceImpl bookService;

    public BookRestController(BookServiceImpl bookService) {
        this.bookService = bookService;
    }

    @PostMapping("/addBook")
    @Operation(summary = "Add a new Book in the Library", description = "Creates a new book if it does not already exist by ISBN")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "409", description = "Conflict: the book already exist"),
            @ApiResponse(responseCode = "201", description = "Created: the book is successfully inserted"),
            @ApiResponse(responseCode = "304", description = "Not Modified: the book is unsuccessfully inserted")
    })
    public ResponseEntity<BookDTO> createNewBook(@RequestBody BookDTO bookDTORequest) {
        Book existingBook = bookService.findBookByIsbn(bookDTORequest.getIsbn());
        if (existingBook != null) {
            return new ResponseEntity<BookDTO>(HttpStatus.CONFLICT);
        }
        Book bookRequest = mapBookDTOToBook(bookDTORequest);
        Book book = bookService.saveBook(bookRequest);
        if (book != null && book.getId() != null) {
            BookDTO bookDTO = mapBookToBookDTO(book);
            return new ResponseEntity<BookDTO>(bookDTO, HttpStatus.CREATED);
        }
        return new ResponseEntity<BookDTO>(HttpStatus.NOT_MODIFIED);
    }

    @PutMapping("/updateBook")
    @Operation(summary = "Update/Modify an existing Book in the Library")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "404", description = "Not Found: the book does not exist"),
            @ApiResponse(responseCode = "200", description = "Ok: the book is successfully updated"),
            @ApiResponse(responseCode = "304", description = "Not Modified: the book is unsuccessfully updated")
    })
    public ResponseEntity<BookDTO> updateBook(@RequestBody BookDTO bookDTORequest) {
        if (!bookService.checkIfIdExists(bookDTORequest.getId())) {
            return new ResponseEntity<BookDTO>(HttpStatus.NOT_FOUND);
        }
        Book bookRequest = mapBookDTOToBook(bookDTORequest);
        Book book = bookService.updateBook(bookRequest);
        if (book != null) {
            BookDTO bookDTO = mapBookToBookDTO(book);
            return new ResponseEntity<BookDTO>(bookDTO, HttpStatus.OK);
        }
        return new ResponseEntity<BookDTO>(HttpStatus.NOT_MODIFIED);
    }

    @DeleteMapping("/deleteBook/{bookId}")
    @Operation(summary = "Delete a Book in the Library", description = "If the book does not exist, nothing is done")
    @ApiResponse(responseCode = "204", description = "No Content: Book successfully deleted")
    public ResponseEntity<String> deleteBook(@PathVariable Integer bookId) {
        bookService.deleteBook(bookId);
        return new ResponseEntity<String>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/searchByTitle")
    @Operation(summary = "Search Books in the Library by title")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ok: successful research"),
            @ApiResponse(responseCode = "204", description = "No Content: no result found")
    })
    public ResponseEntity<List<BookDTO>> searchBookByTitle(@RequestParam("title") String title,
                                                           UriComponentsBuilder uriComponentBuilder) {
        List<Book> books = bookService.findBooksByTitleOrPartTitle(title);
        if (!CollectionUtils.isEmpty(books)) {
            books.removeAll(Collections.singleton(null));
            List<BookDTO> bookDTOs = books.stream().map(book -> {
                return mapBookToBookDTO(book);
            }).collect(Collectors.toList());
            return new ResponseEntity<List<BookDTO>>(bookDTOs, HttpStatus.OK);
        }
        return new ResponseEntity<List<BookDTO>>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/searchByIsbn")
    @Operation(summary = "Search a Book in the Library by its ISBN")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ok: successful research"),
            @ApiResponse(responseCode = "204", description = "No Content: no result found")
    })
    public ResponseEntity<BookDTO> searchBookByIsbn(@RequestParam("isbn") String isbn,
                                                    UriComponentsBuilder uriComponentBuilder) {
        Book book = bookService.findBookByIsbn(isbn);
        if (book != null) {
            BookDTO bookDTO = mapBookToBookDTO(book);
            return new ResponseEntity<BookDTO>(bookDTO, HttpStatus.OK);
        }
        return new ResponseEntity<BookDTO>(HttpStatus.NO_CONTENT);
    }

    private BookDTO mapBookToBookDTO(Book book) {
        ModelMapper mapper = new ModelMapper();
        BookDTO bookDTO = mapper.map(book, BookDTO.class);
        if (book.getCategory() != null) {
            bookDTO.setCategory(new CategoryDTO(book.getCategory().getCode(), book.getCategory().getLabel()));
        }
        return bookDTO;
    }

    private Book mapBookDTOToBook(BookDTO bookDTO) {
        ModelMapper mapper = new ModelMapper();
        Book book = mapper.map(bookDTO, Book.class);
        book.setCategory(new Category(bookDTO.getCategory().getCode(), ""));
        book.setRegisterDate(LocalDate.now());
        return book;
    }
}