package com.example.expensetracker.repository;

import com.example.expensetracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // For date filter without user
    List<Expense> findByDateBetween(LocalDate from, LocalDate to);

    // For user-specific in future
    List<Expense> findByUserId(Long userId);

    List<Expense> findByUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to);
}
