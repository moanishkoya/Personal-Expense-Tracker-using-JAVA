# Personal-Expense-Tracker-using-JAVA

# Expense Tracker Backend

A simple RESTful backend for a **Personal Expense Tracker** built with **Spring Boot 3**, **Spring Data JPA**, and **MySQL**.  
This service exposes APIs to create, list, filter, and delete expenses, which can be consumed by any frontend (web/mobile).

---

## ✨ Features

- Add new expenses with:
  - Description
  - Amount
  - Category
  - Date
- Get all expenses
- Filter expenses by date range (`from` and `to`)
- Delete expenses by ID
- Uses MySQL database with JPA & Hibernate
- CORS enabled for all origins (easy to connect from any frontend)

---

## 🧱 Tech Stack

- **Language**: Java 17  
- **Framework**: Spring Boot 3  
- **Database**: MySQL  
- **ORM**: Spring Data JPA / Hibernate  
- **Build Tool**: Maven  

---

## 📁 Project Structure

```text
expense-tracker-backend/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/example/expensetracker/
        │       ├── ExpenseTrackerApplication.java   # Main Spring Boot application
        │       ├── entity/
        │       │   └── Expense.java                 # Expense entity (JPA)
        │       ├── repository/
        │       │   └── ExpenseRepository.java       # JPA repository for Expense
        │       ├── service/
        │       │   └── ExpenseService.java          # Business logic for expenses
        │       └── controller/
        │           └── ExpenseController.java       # REST API endpoints
        └── resources/
            └── application.properties               # DB & JPA configuration
