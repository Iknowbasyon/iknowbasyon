// Demo records for Aralin 1-4, Gawain 1-3
// Mapping object (aralin number as key, gawain number as subkey)
const gawainNames = {
  1: { 1: "Tuklas Kaalaman", 2: "Laro ng Talino", 3: "Sagot ko! Panalo ako!" },
  2: { 1: "Balitaan mo ako!", 2: "Hibla ng Alaala", 3: "Tama o Tsamba" },
  3: { 1: "Salituklas", 2: "Kilatisin", 3: "Tumpak O Lagapak" },
  4: { 1: "", 2: "Exam 2", 3: "Exam 3" }
};
// In your renderTable function, update this line:

const quizRecords = [
  { username: "Maria", aralin: 1, gawain: 1, score: 90, date: "2025-10-01" },
  { username: "Maria", aralin: 1, gawain: 2, score: 85, date: "2025-10-02" },
  { username: "Maria", aralin: 1, gawain: 3, score: 92, date: "2025-10-03" },
  { username: "Juan",  aralin: 2, gawain: 1, score: 88, date: "2025-10-04" },
  { username: "Juan",  aralin: 2, gawain: 2, score: 91, date: "2025-10-05" },
  { username: "Juan",  aralin: 2, gawain: 3, score: 91, date: "2025-10-05" },
  { username: "Ana",   aralin: 3, gawain: 1, score: 95, date: "2025-10-06" },
  { username: "Ana",   aralin: 3, gawain: 2, score: 90, date: "2025-10-09" },
  { username: "Ana",   aralin: 3, gawain: 3, score: 90, date: "2025-10-09" },
  { username: "Pedro", aralin: 4, gawain: 1, score: 87, date: "2025-10-10" },
  { username: "Pedro", aralin: 4, gawain: 3, score: 89, date: "2025-10-11" },
  { username: "Luis",  aralin: 4, gawain: 2, score: 86, date: "2025-10-12" },
];

// Render filtered records
function renderTable(records) {
  const tbody = document.querySelector("#quizTable tbody");
  tbody.innerHTML = "";
  records.forEach(record => {
    const tr = document.createElement('tr');
 tr.innerHTML = `
  <td>${record.username}</td>
  <td>Aralin ${record.aralin}</td>
  <td>${gawainNames[record.aralin]?.[record.gawain] || `Gawain ${record.gawain}`}</td>
  <td>${record.score}</td>
  <td>${record.date}</td>
`;

    tbody.appendChild(tr);
  });
}

function filterRecords() {
  const aralinVal = document.getElementById('aralinSelect').value;
  const gawainVal = document.getElementById('gawainSelect').value;

  let filtered = quizRecords;

  // Filter first by aralin (if selected)
  if (aralinVal) filtered = filtered.filter(r => r.aralin == aralinVal);

  // Then by gawain (if selected)
  if (gawainVal) filtered = filtered.filter(r => r.gawain == gawainVal);

  renderTable(filtered);
}

// Initial render
renderTable(quizRecords);

// Listen to both dropdown changes
document.getElementById('aralinSelect').addEventListener('change', filterRecords);
document.getElementById('gawainSelect').addEventListener('change', filterRecords);