// ============================================================
// Bookplate: starter code
// Read it top to bottom once. Then do the exercises at the end.
// ============================================================

// ---------- 1. Saved data ----------
// We keep your books in the browser (localStorage) as a list.
// Each saved book looks like: { key, title, author, year, cover, rating }
const STORAGE_KEY = "my-book-log";

function loadBooks() {
  const text = localStorage.getItem(STORAGE_KEY);
  return text ? JSON.parse(text) : [];
}

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

let myBooks = loadBooks();

// ---------- 2. Talk to Open Library ----------
// Open Library is a free book database. No account or key needed.
async function searchBooks(query) {
  const url =
    "https://openlibrary.org/search.json?limit=12&fields=key,title,author_name,first_publish_year,cover_i" +
    "&q=" + encodeURIComponent(query);
  const response = await fetch(url);
  const data = await response.json();
  return data.docs; // a list of books
}

function coverUrl(coverId) {
  // Open Library serves cover images by id. If there is none, we show a grey box.
  return coverId ? "https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg" : "";
}

// ---------- 3. Draw things on the page ----------
const resultsEl = document.getElementById("results");
const mineEl = document.getElementById("mine");
const statusEl = document.getElementById("status");

function renderResults(docs) {
  resultsEl.innerHTML = "";
  docs.forEach(function (doc) {
    const card = document.createElement("div");
    card.className = "book";
    const author = doc.author_name ? doc.author_name[0] : "Unknown author";
    card.innerHTML =
      '<img alt="" src="' + coverUrl(doc.cover_i) + '">' +
      "<h3></h3><p></p>" +
      '<select><option value="">Rating</option>' +
      "<option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>" +
      '<button class="primary">Add to my books</button>';
    // textContent is safer than putting text inside innerHTML
    card.querySelector("h3").textContent = doc.title;
    card.querySelector("p").textContent = author + (doc.first_publish_year ? " (" + doc.first_publish_year + ")" : "");

    card.querySelector("button").addEventListener("click", function () {
      const rating = card.querySelector("select").value;
      addBook({
        key: doc.key,
        title: doc.title,
        author: author,
        year: doc.first_publish_year || "",
        cover: coverUrl(doc.cover_i),
        rating: rating ? Number(rating) : 0,
      });
    });
    resultsEl.appendChild(card);
  });
}

function renderMine() {
  mineEl.innerHTML = "";
  if (myBooks.length === 0) {
    mineEl.innerHTML = "<p>No books yet. Search for one and press Add.</p>";
    return;
  }
  myBooks.forEach(function (book) {
    const card = document.createElement("div");
    card.className = "book";
    card.innerHTML = '<img alt="" src="' + book.cover + '"><h3></h3><p></p><p></p><button>Remove</button>';
    card.querySelector("h3").textContent = book.title;
    card.querySelectorAll("p")[0].textContent = book.author;
    card.querySelectorAll("p")[1].textContent = book.rating ? "Rating: " + book.rating + " / 5" : "Not rated";
    card.querySelector("button").addEventListener("click", function () {
      removeBook(book.key);
    });
    mineEl.appendChild(card);
  });
}

// ---------- 4. Actions ----------
function addBook(book) {
  // Replace the book if it was already saved, so there are no duplicates.
  myBooks = myBooks.filter(function (b) { return b.key !== book.key; });
  myBooks.push(book);
  saveBooks(myBooks);
  renderMine();
  statusEl.textContent = "Saved: " + book.title;
}

function removeBook(key) {
  myBooks = myBooks.filter(function (b) { return b.key !== key; });
  saveBooks(myBooks);
  renderMine();
}

// ---------- 5. Wire up the buttons ----------
document.getElementById("search-form").addEventListener("submit", async function (event) {
  event.preventDefault(); // stop the page from reloading
  const query = document.getElementById("search-input").value.trim();
  statusEl.textContent = "Searching...";
  try {
    const docs = await searchBooks(query);
    statusEl.textContent = docs.length ? "" : "No results. Try another search.";
    renderResults(docs);
  } catch (error) {
    statusEl.textContent = "Could not reach Open Library. Check your internet and try again.";
  }
});

function showScreen(name) {
  document.getElementById("screen-search").hidden = name !== "search";
  document.getElementById("screen-mine").hidden = name !== "mine";
  document.getElementById("tab-search").classList.toggle("active", name === "search");
  document.getElementById("tab-mine").classList.toggle("active", name === "mine");
}
document.getElementById("tab-search").addEventListener("click", function () { showScreen("search"); });
document.getElementById("tab-mine").addEventListener("click", function () { showScreen("mine"); });

renderMine();

// ============================================================
// EXERCISES (do them in this order)
// 1. Add a "review" text box. Save the text with the book and show it in My books.
// 2. Turn the 1-5 dropdown into clickable stars (then half stars).
// 3. Add a "date finished" field and sort My books by that date.
// 4. Add a Stats screen: total books, average rating.
// 5. Add shelves: Want to read, Reading, Read.
// ============================================================
