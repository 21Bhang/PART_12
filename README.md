# Full Stack Open - Part 12 (Containers)

Exercise repository for Part 12 of Full Stack Open.

## Contents

- `todo-app/` - the course todo app containerized (exercises 13-20)
- `todo-tests/` - Playwright E2E tests, run locally and in CI (exercise 21)
- `my-app/` - containerized development environment of my own full stack app (exercise 22)
- `answers/` - answers to the exercises

## Exercise 22: My containerized dev env

`my-app/` contains a containerized development environment of my own full
stack app **flightdiaries** (Flight Diaries), which I built during Part 9
of the course.

Link to the full stack app repository: https://github.com/JunubBTC/PART_9
(public, the app itself lives in the `flightdiaries` directory).

The development environment is started with:

    cd my-app
    docker compose -f docker-compose.dev.yml up --build

The app is then available at http://localhost:8080 through the nginx
reverse proxy.
