// Handle the form submission
document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const formData = new FormData();
    formData.append('file1', document.getElementById('file1').files[0]);
  
    fetch('/compare', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log('Comparison result:', data);
  
      let resultHTML = "";
  
      // Display differences
      if (data.diff && data.diff.length > 0) {
        resultHTML += "<div class='diff'><h3>Differences Found:</h3>";
        data.diff.forEach(diff => {
          resultHTML += `
            <p><strong>Line ${diff.line}:</strong><br>
            <strong>Pre-existing:</strong> ${diff.pre}<br>
            <strong>Uploaded:</strong> ${diff.uploaded}</p>
          `;
        });
        resultHTML += "</div>";
      } else {
        resultHTML += "<h2>No differences found. The documents are identical.</h2>";
      }
  
      // Display suggestions (missed data and additional data)
      if (data.suggestions) {
        if (data.suggestions.missedData.length > 0) {
          resultHTML += "<div class='suggestions'><h3>Missed Data:</h3>";
          data.suggestions.missedData.forEach(suggestion => {
            resultHTML += `<p>${suggestion}</p>`;
          });
          resultHTML += "</div>";
        }
  
        if (data.suggestions.additionalData.length > 0) {
          resultHTML += "<div class='suggestions'><h3>Additional Data:</h3>";
          data.suggestions.additionalData.forEach(suggestion => {
            resultHTML += `<p>${suggestion}</p>`;
          });
          resultHTML += "</div>";
        }
      }
  
      document.getElementById('result').innerHTML = resultHTML;
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('result').innerHTML = "Error comparing documents.";
    });
  });
  