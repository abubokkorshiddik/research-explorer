function cleanQuery(query) {
    return query.replace(/AND/g, "+")
                .replace(/OR/g, " ")
                .replace(/NOT/g, "-");
}

function getYear(p) {
    return p.created?.["date-parts"]?.[0]?.[0] || null;
}

function getAuthors(p) {
    return p.author
        ? p.author.map(a => a.family).join("; ")
        : "";
}
