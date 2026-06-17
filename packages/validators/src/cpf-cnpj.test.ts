import { describe, expect, test } from "bun:test";
import {
	isValidCnpj,
	isValidCpf,
	isValidCpfCnpj,
	isValidPhone,
} from "./cpf-cnpj";

describe("isValidCpf", () => {
	test("aceita CPF válido sem máscara", () => {
		expect(isValidCpf("52998224725")).toBe(true);
	});

	test("aceita CPF válido com máscara", () => {
		expect(isValidCpf("529.982.247-25")).toBe(true);
	});

	test("rejeita dígito verificador errado", () => {
		expect(isValidCpf("52998224724")).toBe(false);
	});

	test("rejeita allSame", () => {
		expect(isValidCpf("11111111111")).toBe(false);
	});

	test("rejeita comprimento errado", () => {
		expect(isValidCpf("123")).toBe(false);
	});
});

describe("isValidCnpj", () => {
	test("aceita CNPJ válido sem máscara", () => {
		expect(isValidCnpj("11222333000181")).toBe(true);
	});

	test("aceita CNPJ válido com máscara", () => {
		expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
	});

	test("rejeita dígito verificador errado", () => {
		expect(isValidCnpj("11222333000182")).toBe(false);
	});

	test("rejeita allSame", () => {
		expect(isValidCnpj("11111111111111")).toBe(false);
	});

	test("rejeita comprimento errado", () => {
		expect(isValidCnpj("1122")).toBe(false);
	});
});

describe("isValidCpfCnpj", () => {
	test("aceita CPF válido (11 dígitos)", () => {
		expect(isValidCpfCnpj("52998224725")).toBe(true);
	});

	test("aceita CNPJ válido (14 dígitos)", () => {
		expect(isValidCpfCnpj("11222333000181")).toBe(true);
	});

	test("rejeita comprimento intermediário (12 dígitos)", () => {
		expect(isValidCpfCnpj("123456789012")).toBe(false);
	});

	test("rejeita CPF inválido passado como isValidCpfCnpj", () => {
		expect(isValidCpfCnpj("52998224724")).toBe(false);
	});

	test("rejeita CNPJ inválido passado como isValidCpfCnpj", () => {
		expect(isValidCpfCnpj("11222333000182")).toBe(false);
	});
});

describe("isValidPhone", () => {
	test("aceita fixo com 10 dígitos", () => {
		expect(isValidPhone("1133334444")).toBe(true);
	});

	test("aceita celular com 11 dígitos e o 9", () => {
		expect(isValidPhone("11999998888")).toBe(true);
	});

	test("aceita entrada mascarada (normaliza antes)", () => {
		expect(isValidPhone("(11) 99999-8888")).toBe(true);
	});

	test("rejeita texto sem dígitos", () => {
		expect(isValidPhone("abc")).toBe(false);
	});

	test("rejeita comprimento inválido (5 dígitos)", () => {
		expect(isValidPhone("11999")).toBe(false);
	});

	test("rejeita allSame", () => {
		expect(isValidPhone("00000000000")).toBe(false);
	});

	test("rejeita DDD fora da faixa (< 11)", () => {
		expect(isValidPhone("0199998888")).toBe(false);
	});

	test("rejeita celular (11 díg) sem o 9 no 3º dígito", () => {
		expect(isValidPhone("11899998888")).toBe(false);
	});
});
