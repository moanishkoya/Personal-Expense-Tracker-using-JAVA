package com.example.expensetracker.service;

import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    /**
     * Get expenses, with optional userId and optional date range.
     * This keeps old frontend working (no userId, no dates)
     * but also allows userId/from/to in future.
     */
    public List<Expense> getExpenses(LocalDate from, LocalDate to, Long userId) {
        boolean hasUser = userId != null;
        boolean hasRange = (from != null && to != null);

        if (hasUser && hasRange) {
            return expenseRepository.findByUserIdAndDateBetween(userId, from, to);
        } else if (hasUser) {
            return expenseRepository.findByUserId(userId);
        } else if (hasRange) {
            return expenseRepository.findByDateBetween(from, to);
        } else {
            return expenseRepository.findAll();
        }
    }

    public Expense createExpense(Expense expense) {
        // If no userId provided from frontend, you can:
        // - leave it null, OR
        // - set default user 1L. Uncomment below if you want that:
        //
        // if (expense.getUserId() == null) {
        //     expense.setUserId(1L);
        // }

        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id, Long userId) {
        Expense e = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // If userId is given, enforce user-specific delete
        if (userId != null && e.getUserId() != null && !e.getUserId().equals(userId)) {
            throw new RuntimeException("You cannot delete another user's expense");
        }

        expenseRepository.deleteById(id);
    }
}
