import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Nome não pode exceder 100 caracteres" }),
  email: z
    .string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email não pode exceder 255 caracteres" }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" })
    .max(100, { message: "Senha não pode exceder 100 caracteres" })
    .regex(/[A-Z]/, { message: "Senha deve conter pelo menos uma letra maiúscula" })
    .regex(/[a-z]/, { message: "Senha deve conter pelo menos uma letra minúscula" })
    .regex(/[0-9]/, { message: "Senha deve conter pelo menos um número" }),
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email não pode exceder 255 caracteres" }),
  password: z
    .string()
    .min(1, { message: "Senha é obrigatória" })
    .max(100, { message: "Senha não pode exceder 100 caracteres" }),
});

export const patientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Nome não pode exceder 100 caracteres" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Telefone inválido" })
    .max(20, { message: "Telefone não pode exceder 20 caracteres" }),
  pathology: z
    .string()
    .trim()
    .min(3, { message: "Patologia deve ter pelo menos 3 caracteres" })
    .max(200, { message: "Patologia não pode exceder 200 caracteres" }),
  sessionPackage: z
    .string()
    .trim()
    .min(1, { message: "Pacote de sessões é obrigatório" })
    .max(50, { message: "Pacote de sessões não pode exceder 50 caracteres" }),
});

export const sessionSchema = z.object({
  evolution: z
    .string()
    .trim()
    .min(10, { message: "Evolução deve ter pelo menos 10 caracteres" })
    .max(1000, { message: "Evolução não pode exceder 1000 caracteres" }),
});
