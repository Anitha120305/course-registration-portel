function getSuggestions() {
  const skinTone = document.getElementById("skinToneSelect").value;

  if (!skinTone) {
    alert("Please select a skin tone.");
    return;
  }

  fetch(/suggestions?skinTone=${skinTone})
    .then((res) => res.json())
    .then((data) => {
      const suggestionDiv = document.getElementById("watchSuggestions");
      suggestionDiv.innerHTML = "";

      if (data.length === 0) {
        suggestionDiv.innerHTML = "<p>No suggestions available.</p>";
        return;
      }

      data.forEach((watch) => {
        const card = document.createElement("div");
        card.className = "watch-card";
        card.innerHTML = `
          <h3>${watch.name}</h3>
          <img src="${watch.image}" alt="${watch.name}" width="150"/>
          <p>${watch.description}</p>
        `;
        suggestionDiv.appendChild(card);
      });
    });
}