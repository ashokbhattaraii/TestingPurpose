/*
 {
        "id": "cmm0vxipl0000umd0e1fs3p2l",
        "uid": "49a9c764-03f8-4281-b2e2-3907919471db",
        "email": "gameab12an@gmail.com",
        "name": "Gamet undefined",
        "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocKDk2d9XZD1NLT5vLlaDFLxiT09alCXgEAuv_KzGvp8bdpPuw=s96-c",
        "role": "SUPER_ADMIN",
        "phone": null,
        "department": null,
        "position": null,
        "startDate": null,
        "bio": null,
        "address": null,
        "emergencyContact": null,
        "isActive": true,
        "lastLoginAt": "2026-02-24T17:41:36.827Z",
        "createdAt": "2026-02-24T17:34:13.495Z",
        "updatedAt": "2026-02-24T17:41:36.834Z"
    },
*/
export interface EmployeeType {
  id: string;
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  role: "EMPLOYEE" | "ADMIN" | "SUPER_ADMIN";
  phone: string | null;
  department: string | null;
  position: string | null;
  startDate: string | null;
  bio: string | null;
  address: string | null;
  emergencyContact: string | null;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}
