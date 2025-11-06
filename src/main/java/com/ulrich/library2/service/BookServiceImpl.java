package com.ulrich.library2.service;

import com.ulrich.library2.entity.book.Book;
import com.ulrich.library2.repository.IBookDao;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("bookService")
@Transactional
public class BookServiceImpl implements IBookService {

    private IBookDao bookDao;

    public BookServiceImpl(IBookDao bookDao) {
        this.bookDao = bookDao;
    }

    @Override
    public Book saveBook(Book book) {
        return bookDao.save(book);
    }

    @Override
    public Book updateBook(Book book) {
        return bookDao.save(book);
    }

    @Override
    public void deleteBook(Integer bookId) {
        bookDao.deleteById(bookId);
    }

    @Override
    public boolean checkIfIdExists(Integer id) {
        return bookDao.existsById(id);
    }

    @Override
    public List<Book> findBooksByTitleOrPartTitle(String title) {
        return bookDao.findByTitleLikeIgnoreCase((new StringBuilder()).append("%").append(title).append("%").toString());
    }

    @Override
    public Book findBookByIsbn(String isbn) {
        return bookDao.findByIsbnIgnoreCase(isbn);
    }

    @Override
    public List<Book> getBooksByCategory(String codeCategory) {
        return bookDao.findByCategory(codeCategory);
    }

}


