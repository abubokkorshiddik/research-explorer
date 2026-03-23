let papers = [];

// MAIN FUNCTION
async function searchAll() {
    try {
        let query = document.getElementById("query").value;
        let yearFrom = document.getElementById("yearFrom").value;
        let yearTo = document.getElementById("yearTo").value;

        if (!query) {
            alert("Please enter a search query");
            return;
        }

        query = cleanQuery(query);

        console.log("Searching for:", query);

        let crossrefData = await fetchCrossRef(query);

        console.log("CrossRef Data:", crossrefData);

        // ONLY CrossRef (Semantic Scholar removed)
        papers = mergeData(crossrefData);

        papers = filterYear(papers, yearFrom, yearTo);

        console.log("Final Papers:", papers);

        displaySummary();
        displayResults();
        drawTrendChart(papers);
        drawAuthorChart(papers);

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Check console (F12).");
    }
}

//////////////////////////////////////////////////
// FETCH FROM CROSSREF
//////////////////////////////////////////////////

async function fetchCrossRef(query) {
    let url = `https://api.crossref.org/works?query=${query}&rows=50`;

    let res = await fetch(url, {
        headers: {
            "User-Agent": "ResearchExplorer/1.0"
        }
    });

    let data = await res.json();
    return data.message.items;
}

//////////////////////////////////////////////////
// CLEAN QUERY
//////////////////////////////////////////////////

function cleanQuery(query) {
    return query
        .replace(/AND/gi, " ")
        .replace(/OR/gi, " ")
        .replace(/NOT/gi, "");
}

//////////////////////////////////////////////////
// MERGE DATA (ONLY CROSSREF NOW)
//////////////////////////////////////////////////

function mergeData(crossref) {
    let merged = [];

    crossref.forEach(p => {
        merged.push({
            title: p.title?.[0] || "No title",
            authors: getAuthors(p),
            year: getYear(p),
            doi: p.DOI || "",
            journal: p["container-title"]?.[0] || ""
        });
    });

    return removeDuplicates(merged);
}

//////////////////////////////////////////////////
// REMOVE DUPLICATES
//////////////////////////////////////////////////

function removeDuplicates(data) {
    let seen = new Set();

    return data.filter(p => {
        let key = p.title.toLowerCase();

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
}

//////////////////////////////////////////////////
// YEAR FILTER
//////////////////////////////////////////////////

function filterYear(data, from, to) {
    return data.filter(p => {
        if (!p.year) return true;

        return (!from || p.year >= from) &&
               (!to || p.year <= to);
    });
}

//////////////////////////////////////////////////
// EXTRACT YEAR
//////////////////////////////////////////////////

function getYear(p) {
    return p.created?.["date-parts"]?.[0]?.[0] || null;
}

//////////////////////////////////////////////////
// EXTRACT AUTHORS
//////////////////////////////////////////////////

function getAuthors(p) {
    if (!p.author) return "No authors";

    return p.author
        .map(a => `${a.given || ""} ${a.family || ""}`.trim())
        .join("; ");
}

//////////////////////////////////////////////////
// DISPLAY SUMMARY
//////////////////////////////////////////////////

function displaySummary() {
    document.getElementById("summary").innerText =
        `Total Papers Found: ${papers.length}`;
}

//////////////////////////////////////////////////
// DISPLAY RESULTS
//////////////////////////////////////////////////

function displayResults() {
    let html = "";

    papers.forEach(p => {
        html += `
        <div style="margin-bottom:15px;">
            <b>${p.title}</b><br>
            ${p.authors}<br>
            ${p.journal}<br>
            ${p.year || "Year N/A"}<br>
            DOI: ${p.doi}
        </div><hr>`;
    });

    document.getElementById("results").innerHTML = html;
}

//////////////////////////////////////////////////
// CSV DOWNLOAD
//////////////////////////////////////////////////

function downloadCSV() {
    let csv = "Title,Authors,Journal,Year,DOI\n";

    papers.forEach(p => {
        csv += `"${p.title}","${p.authors}","${p.journal}","${p.year}","${p.doi}"\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });
    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "papers.csv";
    link.click();
}

//////////////////////////////////////////////////
// CHARTS (SAFE VERSION)
//////////////////////////////////////////////////

function drawTrendChart(data) {
    if (!window.Chart) return;

    let count = {};

    data.forEach(p => {
        if (!p.year) return;
        count[p.year] = (count[p.year] || 0) + 1;
    });

    let years = Object.keys(count).sort();
    let values = years.map(y => count[y]);

    new Chart(document.getElementById("trendChart"), {
        type: "line",
        data: {
            labels: years,
            datasets: [{
                label: "Publications",
                data: values
            }]
        }
    });
}

function drawAuthorChart(data) {
    if (!window.Chart) return;

    let count = {};

    data.forEach(p => {
        p.authors.split(";").forEach(a => {
            let name = a.trim();
            if (!name) return;
            count[name] = (count[name] || 0) + 1;
        });
    });

    let top = Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    new Chart(document.getElementById("authorChart"), {
        type: "bar",
        data: {
            labels: top.map(t => t[0]),
            datasets: [{
                label: "Top Authors",
                data: top.map(t => t[1])
            }]
        }
    });
}
