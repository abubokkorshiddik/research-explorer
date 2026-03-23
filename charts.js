function drawTrendChart(data) {
    let count = {};

    data.forEach(p => {
        count[p.year] = (count[p.year] || 0) + 1;
    });

    let years = Object.keys(count).sort();
    let values = years.map(y => count[y]);

    new Chart(document.getElementById("trendChart"), {
        type: "line",
        data: {
            labels: years,
            datasets: [{ label: "Publications", data: values }]
        }
    });
}

function drawAuthorChart(data) {
    let count = {};

    data.forEach(p => {
        p.authors.split(";").forEach(a => {
            count[a] = (count[a] || 0) + 1;
        });
    });

    let top = Object.entries(count)
        .sort((a,b) => b[1]-a[1])
        .slice(0,10);

    new Chart(document.getElementById("authorChart"), {
        type: "bar",
        data: {
            labels: top.map(t => t[0]),
            datasets: [{ label: "Top Authors", data: top.map(t => t[1]) }]
        }
    });
}
