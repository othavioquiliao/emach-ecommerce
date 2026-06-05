import { beforeEach, describe, expect, it, vi } from "vitest";

import { getOriginBranchCep } from "./origin-branch";

const selectChain = {
	from: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	limit: vi.fn(),
};

vi.mock("@emach/env/server", () => ({
	env: { DEFAULT_BRANCH_ID: "branch-curitiba" },
}));
vi.mock("@emach/db", () => ({
	db: { select: vi.fn(() => selectChain) },
}));

beforeEach(() => vi.clearAllMocks());

describe("getOriginBranchCep", () => {
	it("retorna o cep da filial de origem (só dígitos)", async () => {
		selectChain.limit.mockResolvedValue([{ cep: "80010-000" }]);
		await expect(getOriginBranchCep()).resolves.toBe("80010000");
	});

	it("lança se a filial não existir ou não tiver cep", async () => {
		selectChain.limit.mockResolvedValue([]);
		await expect(getOriginBranchCep()).rejects.toThrow();
	});
});
