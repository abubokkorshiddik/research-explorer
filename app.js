let papers = [];

async function searchAll() {
    let query = document.getElementById("query").value;
    let yearFrom = document.getElementById("yearFrom").value;
    let yearTo = document.getElementById("yearTo").value;

    query = cleanQuery(query);

    let crossrefData = await fetchCrossRef(query);
    let semanticData = await fetchSemantic(query);

    papers = mergeData(crossrefData, semanticData);

    papers = filterYear(papers, yearFrom, yearTo);

    displaySummary();
    displayResults();
    drawTrendChart(papers);
    drawAuthorChart(papers);
}
