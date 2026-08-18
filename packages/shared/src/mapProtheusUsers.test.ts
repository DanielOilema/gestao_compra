import { describe, expect, it } from "vitest";
import { mapProtheusUsersResponse } from "@gestao-compra/shared";

describe("mapProtheusUsersResponse", () => {
  it("maps array response", () => {
    const result = mapProtheusUsersResponse([
      { id: "1", displayName: "Admin", userName: "admin" },
    ]);

    expect(result).toEqual([
      { id: "1", displayName: "Admin", userName: "admin" },
    ]);
  });

  it("maps items wrapper response", () => {
    const result = mapProtheusUsersResponse({
      items: [{ id: "2", displayName: "User", userName: "user01" }],
    });

    expect(result).toEqual([
      { id: "2", displayName: "User", userName: "user01" },
    ]);
  });

  it("skips invalid rows", () => {
    const result = mapProtheusUsersResponse([
      { displayName: "Sem ID" },
      { id: "3", userName: "valid" },
    ]);

    expect(result).toEqual([
      { id: "3", displayName: "valid", userName: "valid" },
    ]);
  });
});
