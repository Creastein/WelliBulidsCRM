fetch('http://localhost:3000')
  .then(res => res.text())
  .then(html => {
    console.log(html.slice(0, 1000));
  })
  .catch(err => console.error("Error:", err));
