const data = [
  { name: "Sara Brown", dateOfBirth: "1901-01-01" },
  { name: "John Smith", dateOfBirth: "1941-01-01" },
  { name: "Jack Ma", dateOfBirth: "1961-01-30" },
  { name: "Elon Musk", dateOfBirth: "1999-01-01" },
];

const dataError = "Error fetching data";
const JSONError = "Invalid JSON data";
const queryError = "Invalid query";
const noData = "No data found";

document.getElementById("insert").addEventListener("click", async function () {
  const response = await fetch("https://lab5backend.onrender.com/insert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const res = await response.json();
  document.getElementById("notify").innerHTML = res.message;
});

document.getElementById("query").addEventListener("click", async function () {
  const text = document.getElementById("text-area").value;
  if (text.trim().toUpperCase().startsWith("INSERT")) {
    const response = await fetch("https://lab5backend.onrender.com/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: text }),
    });

    const res = await response.json();
    document.getElementById("notify").innerHTML = res.message;
  } else if(text.trim().toUpperCase().startsWith("SELECT")){
    try {
      const response = await fetch(`https://lab5backend.onrender.com/queryRead/${encodeURIComponent(text)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const res = await response.json();
        console.log(res.message)
        if (res.message === dataError || res.message === JSONError) {
          document.getElementById("notify").innerHTML = res.message;
          return;
        }else if(res.message.length === 0){
          document.getElementById("notify").innerHTML = noData;
          return;
        }
        createTable(res.message);
      } else {
        // Handle errors here
        console.error(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      // Handle other errors, e.g., network issues
      console.error("Error:", error);
    }
  }else{
    document.getElementById("notify").innerHTML = queryError;
  }
});

function createTable(data) {
  const tableContainer = document.getElementById("notify");
  tableContainer.innerHTML = "";
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Create table header row
  const headerRow = thead.insertRow();
  for (const key in data[0]) {
    if (data[0].hasOwnProperty(key)) {
      const th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
    }
  }

  // Create table rows with data
  data.forEach((item) => {
    const row = tbody.insertRow();
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        const cell = row.insertCell();
        cell.textContent = item[key];
      }
    }
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
}
