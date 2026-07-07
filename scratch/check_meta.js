fetch('http://localhost:3000')
  .then(res => res.text())
  .then(html => {
    const match = html.match(/<meta name="viewport"[^>]*>/i);
    console.log("Viewport Meta Tag:", match ? match[0] : "NOT FOUND");
  })
  .catch(err => console.error("Error:", err));
