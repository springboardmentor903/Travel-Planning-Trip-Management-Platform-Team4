package com.tripnest.tripnest_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.repository.BudgetRepository;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    public Optional<Budget> getBudgetById(Integer id) {
        return budgetRepository.findById(id);
    }

    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(Integer id, Budget budget) {
        Budget existingBudget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        existingBudget.setTotalBudget(budget.getTotalBudget());
        existingBudget.setSpentAmount(budget.getSpentAmount());

        return budgetRepository.save(existingBudget);
    }

    public void deleteBudget(Integer id) {
        budgetRepository.deleteById(id);
    }
}