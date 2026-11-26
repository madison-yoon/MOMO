import { safeRequestFailure } from "./safeRequestFailure";
test("omits credentials, response data and exception messages", () => {
 const error = { code: "ERR_BAD_RESPONSE", message: "private", response: { status: 401, data: { password: "private" } }, config: { headers: { Authorization: "private" }, data: "private" } };
 expect(safeRequestFailure(error)).toEqual({ status: 401, code: "ERR_BAD_RESPONSE" });
 expect(JSON.stringify(safeRequestFailure(error))).not.toContain("private");
});
test("unknown codes and malformed status cannot inject sensitive text", () => {
 expect(safeRequestFailure({ code: "private", response: { status: "private" } })).toEqual({ status: null, code: null });
 expect(safeRequestFailure(null)).toEqual({ status: null, code: null });
});
