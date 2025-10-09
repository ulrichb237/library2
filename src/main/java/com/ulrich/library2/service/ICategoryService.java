package com.ulrich.library2.service;

import com.ulrich.library2.entity.category.Category;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

public interface ICategoryService {

    public List<Category> getAllCategories();

}

