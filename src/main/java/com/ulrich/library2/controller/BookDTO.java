
package com.ulrich.library2.controller;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;

@Schema(name = "Book Model", description = "Represents a book in the library")
public class BookDTO implements Comparable<BookDTO> {

    @Schema(description = "Book id")
    private Integer id;

    @Schema(description = "Book title")
    private String title;

    @Schema(description = "Book isbn")
    private String isbn;

    @Schema(description = "Book release date by the editor")
    private LocalDate releaseDate;

    @Schema(description = "Book register date in the library")
    private LocalDate registerDate;

    @Schema(description = "Book total examplaries")
    private Integer totalExamplaries;

    @Schema(description = "Book author")
    private String author;

    @Schema(description = "Book category")
    private CategoryDTO category;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public LocalDate getRegisterDate() {
        return registerDate;
    }

    public void setRegisterDate(LocalDate registerDate) {
        this.registerDate = registerDate;
    }

    public Integer getTotalExamplaries() {
        return totalExamplaries;
    }

    public void setTotalExamplaries(Integer totalExamplaries) {
        this.totalExamplaries = totalExamplaries;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public CategoryDTO getCategory() {
        return category;
    }

    public void setCategory(CategoryDTO category) {
        this.category = category;
    }

    @Override
    public int compareTo(BookDTO o) {
        return title.compareToIgnoreCase(o.getTitle());
    }
}