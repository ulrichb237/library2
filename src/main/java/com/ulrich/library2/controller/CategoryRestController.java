

package com.ulrich.library2.controller;

import com.ulrich.library2.entity.category.Category;
import com.ulrich.library2.service.CategoryServiceImpl;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rest/category/api")
@Tag(name = "Book Category Rest Controller", description = "Contains operations for managing book categories")
public class CategoryRestController {

    private CategoryServiceImpl categoryService;

    public CategoryRestController(CategoryServiceImpl categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/allCategories")
    @Operation(summary = "List all book categories of the Library")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ok: successfully listed"),
            @ApiResponse(responseCode = "204", description = "No Content: no result found")
    })
    public ResponseEntity<List<CategoryDTO>> getAllBookCategories() {
        List<Category> categories = categoryService.getAllCategories();
        if (!CollectionUtils.isEmpty(categories)) {
            categories.removeAll(Collections.singleton(null));
            List<CategoryDTO> categoryDTOs = categories.stream().map(category -> {
                return mapCategoryToCategoryDTO(category);
            }).collect(Collectors.toList());
            return new ResponseEntity<List<CategoryDTO>>(categoryDTOs, HttpStatus.OK);
        }
        return new ResponseEntity<List<CategoryDTO>>(HttpStatus.NO_CONTENT);
    }

    private CategoryDTO mapCategoryToCategoryDTO(Category category) {
        ModelMapper mapper = new ModelMapper();
        CategoryDTO categoryDTO = mapper.map(category, CategoryDTO.class);
        return categoryDTO;
    }
}