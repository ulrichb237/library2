package com.ulrich.library2.service;

import com.ulrich.library2.entity.book.Book;

import java.util.List;

public interface IBookService {

    public Book saveBook(Book book);

    public Book updateBook(Book book);

    public void deleteBook(Integer bookId);

    public List<Book> findBooksByTitleOrPartTitle(String title);

    public Book findBookByIsbn(String isbn);

    public boolean checkIfIdExists(Integer id);

    public List<Book> getBooksByCategory(String codeCategory);

}

