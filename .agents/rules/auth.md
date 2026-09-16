# Authentication & Authorization Rules

## 1. The 4 Authenticated Actor Roles
The system strictly distinguishes between 4 actor categories:
1. **`SYSTEM_ADMIN`**: Global platform administrator stored in `system_admins`.
2. **`HOSPITAL`**: Origin hospital administrator. Credentials (`admin_email`, `password_hash`) are stored directly on the `hospitals` table — not as a separate person entity.
3. **`DOCTOR`**: Clinical practitioner stored in `doctors`, associated with a specific `hospital_id`.
4. **`PATIENT`**: Healthcare record owner stored in `patients`, controlling consent and active access grants.

## 2. Password Hashing & Demo Credentials
* Passwords must **never** be stored in plain text.
* All passwords use `bcryptjs` hashing with cost factor 10.
* **Universal Demo Password**: For development, testing, and FYP presentations, all seeded synthetic users share the exact same password: `password123`.

## 3. JWT Architecture (No Magic Frameworks)
* Standard `jsonwebtoken` (`Bearer <token>`) headers for maximum clarity and teammate comprehension in FYP defenses.
* **Token Payload**:
  ```ts
  {
    id: string;
    email: string;
    role: 'SYSTEM_ADMIN' | 'HOSPITAL' | 'DOCTOR' | 'PATIENT';
    name: string;
    hospitalId?: string | null;
  }
  ```
* **Expiration**: 7 days (`7d`).

## 4. Middleware Guards
* **`authenticate`**: Verifies the Bearer JWT from `req.headers.authorization` and attaches `req.user`. Returns 401 if missing or invalid.
* **`requireRole(...allowedRoles)`**: Enforces role-based access control. Returns 403 Forbidden if the authenticated user's role is not permitted.
