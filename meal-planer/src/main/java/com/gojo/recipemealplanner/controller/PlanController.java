package com.gojo.recipemealplanner.controller;

import com.gojo.recipemealplanner.model.PlanEntry;
import com.gojo.recipemealplanner.repository.PlanRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "*")
public class PlanController {

    private final PlanRepository planRepository;

    public PlanController(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @GetMapping
    public List<PlanEntry> getAllPlans() {
        return planRepository.findAll();
    }

    @PostMapping
    public PlanEntry createPlan(@RequestBody PlanEntry planEntry) {
        return planRepository.save(planEntry);
    }

    @DeleteMapping("/{id}")
    public void deletePlan(@PathVariable Long id) {
        planRepository.deleteById(id);
    }

    @DeleteMapping("/clear")
    public void clearAllPlans() {
        planRepository.deleteAll();
    }
}