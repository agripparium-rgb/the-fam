# Repository Setup and Training Guide

This guide is for lessons, education, and training sessions using this repository.

## 1) Prerequisites

- A GitHub account
- Git installed on your computer
- A code editor (for example: VS Code)

## 2) Clone the Repository

Use HTTPS:

```bash
git clone https://github.com/agripparium-rgb/the-fam.git
cd the-fam
```

Use SSH (optional):

```bash
git clone git@github.com:agripparium-rgb/the-fam.git
cd the-fam
```

## 3) Create Your Working Branch

```bash
git checkout -b lesson/<your-name>-practice
```

Example:

```bash
git checkout -b lesson/alex-practice
```

## 4) Make a Small Practice Change

1. Open `README.md`
2. Add a short line with your name or lesson note
3. Save the file

## 5) Commit Your Change

```bash
git add README.md
git commit -m "docs: add lesson practice note"
```

## 6) Push Your Branch

```bash
git push -u origin lesson/<your-name>-practice
```

## 7) Open a Pull Request

1. Go to the repository on GitHub
2. Select your branch
3. Click **Compare & pull request**
4. Add a clear title and short description
5. Submit the pull request

## 8) Suggested Training Flow

- Lesson 1: Clone and branch workflow
- Lesson 2: Commit best practices
- Lesson 3: Pull request basics
- Lesson 4: Review feedback and updates

## 9) Good Practices for Students

- Use small, focused commits
- Write clear commit messages
- Ask for review before merging
- Keep your branch updated with the default branch

## 10) Common Commands Reference

```bash
git status
git fetch origin
git rebase origin/main lesson/<your-name>-practice
git add .
git commit -m "your message"
git push
```

If the default branch is not `main`, replace `main` with your repository default branch name.
