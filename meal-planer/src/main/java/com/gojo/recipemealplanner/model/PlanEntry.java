package com.gojo.recipemealplanner.model;

import jakarta.persistence.*;

@Entity
public class PlanEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plan_day")
    private String day;

    private Long recipeId;

    public PlanEntry() {
    }

    public PlanEntry(String day, Long recipeId) {
        this.day = day;
        this.recipeId = recipeId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }
}