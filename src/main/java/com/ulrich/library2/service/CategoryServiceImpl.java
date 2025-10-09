package com.ulrich.library2.service;


import com.ulrich.library2.entity.category.Category;
import com.ulrich.library2.repository.ICategoryDao;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("categoryService")
public class CategoryServiceImpl implements ICategoryService {

    private ICategoryDao categoryDao;

    public CategoryServiceImpl(ICategoryDao categoryDao) {
        this.categoryDao = categoryDao;
    }

    @Override
    public List<Category> getAllCategories(){
        return categoryDao.findAll();
    }

}


