package com.ulrich.library2.repository;


import com.ulrich.library2.entity.book.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IBookDao extends JpaRepository<Book, Integer> {

    Book findByIsbnIgnoreCase(String isbn);

    public List<Book> findByTitleLikeIgnoreCase(String title);

    @Query(   "SELECT b "
            + "FROM Book b "
            + "INNER JOIN b.category cat "
            + "WHERE cat.code = :code"
    )
    public List<Book> 	findByCategory(@Param("code") String codeCategory);

}


