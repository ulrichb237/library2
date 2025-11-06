package com.ulrich.library2.repository;


import com.ulrich.library2.entity.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
    public interface ICategoryDao extends JpaRepository<Category, Integer> {
    }


