# DEPRECATED — do not run

This module is an early scaffold that conflicts with **identity-service**
(same port 8081, incompatible `users` table). It is **not** in
`docker-compose.yml` and must not be added.

All user/auth APIs live under `backend/identity-service` and are reached via:

- `/api/auth/**`
- `/api/users/**`

Safe to delete this folder in a follow-up cleanup commit.
