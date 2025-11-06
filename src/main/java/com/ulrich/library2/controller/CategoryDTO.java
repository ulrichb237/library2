




package com.ulrich.library2.controller;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Category Model", description = "Represents a book category")
public class CategoryDTO implements Comparable<CategoryDTO> {

    public CategoryDTO() {
    }

    public CategoryDTO(String code, String label) {
        super();
        this.code = code;
        this.label = label;
    }

    @Schema(description = "Category code")
    private String code;

    @Schema(description = "Category label")
    private String label;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    @Override
    public int compareTo(CategoryDTO o) {
        return label.compareToIgnoreCase(o.label);
    }
}