export function readPagination(c) {
    const rawPage = c.req.query("page");
    const rawPageSize = c.req.query("pageSize");
    if (rawPage === undefined && rawPageSize === undefined)
        return null;
    const page = Number(rawPage ?? 1);
    const pageSize = Number(rawPageSize ?? 10);
    const skip = (page - 1) * pageSize;
    if (!Number.isSafeInteger(page) || page < 1 ||
        !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 ||
        !Number.isSafeInteger(skip) || skip > 2_147_483_647)
        return false;
    return { page, pageSize, skip };
}
