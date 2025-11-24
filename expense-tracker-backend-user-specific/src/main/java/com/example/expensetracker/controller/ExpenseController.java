package com.example.expensetracker.controller;

import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.service.ExpenseService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    // Works with:
    // - GET /api/expenses
    // - GET /api/expenses?from=2025-01-01&to=2025-01-31
    // - GET /api/expenses?userId=1
    // - GET /api/expenses?userId=1&from=...&to=...
    @GetMapping
    public List<Expense> getExpenses(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return expenseService.getExpenses(from, to, userId);
    }

    // POST /api/expenses
    // Body: { description, amount, category, date, (optional) userId }
    @PostMapping
    public Expense createExpense(@RequestBody Expense expense) {
        return expenseService.createExpense(expense);
    }

    // DELETE /api/expenses/{id}
    // or: DELETE /api/expenses/{id}?userId=1
    @DeleteMapping("/{id}")
    public void deleteExpense(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId
    ) {
        expenseService.deleteExpense(id, userId);
    }
}
