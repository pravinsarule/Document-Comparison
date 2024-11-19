const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

const app = express();
const port = 3000;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Endpoint for file comparison
app.post('/compare', upload.single('file1'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const uploadedFilePath = req.file.path;
  const preExistingPDFPath = path.join(__dirname, 'assets', 'MAHA RERA MODEL AGREEMENT FOR SALE.pdf');

  // Read pre-existing PDF (assuming it's in the 'assets' folder)
  fs.readFile(preExistingPDFPath, (err, preExistingPDF) => {
    if (err) {
      console.error("Error reading pre-existing PDF:", err);
      return res.status(500).send('Error reading pre-existing PDF.');
    }

    // Parse the pre-existing PDF
    pdfParse(preExistingPDF).then(preExistingText => {
      // Read the uploaded file
      fs.readFile(uploadedFilePath, (err, uploadedPDF) => {
        if (err) {
          console.error("Error reading uploaded file:", err);
          return res.status(500).send('Error reading uploaded file.');
        }

        // Parse the uploaded PDF
        pdfParse(uploadedPDF).then(uploadedText => {
          // Compare the two texts
          const diff = compareText(preExistingText.text, uploadedText.text);
          const suggestions = generateSuggestions(preExistingText.text, uploadedText.text);

          // Send the comparison result back to the frontend
          res.json({
            preExistingText: preExistingText.text,
            uploadedText: uploadedText.text,
            diff: diff,
            suggestions: suggestions
          });
        }).catch(err => {
          console.error("Error parsing uploaded PDF:", err);
          res.status(500).send('Error parsing uploaded file.');
        });
      });
    }).catch(err => {
      console.error("Error parsing pre-existing PDF:", err);
      res.status(500).send('Error parsing pre-existing PDF.');
    });
  });
});

// Simple text comparison function
function compareText(preExisting, uploaded) {
  const preLines = preExisting.split('\n');
  const uploadedLines = uploaded.split('\n');
  const maxLength = Math.max(preLines.length, uploadedLines.length);

  const diff = [];
  for (let i = 0; i < maxLength; i++) {
    if (preLines[i] !== uploadedLines[i]) {
      diff.push({
        line: i + 1,
        pre: preLines[i] || "No content",
        uploaded: uploadedLines[i] || "No content"
      });
    }
  }
  return diff;
}

// Generate suggestions for missed or additional content
function generateSuggestions(preExisting, uploaded) {
  const preLines = preExisting.split('\n');
  const uploadedLines = uploaded.split('\n');
  
  const suggestions = {
    missedData: [],
    additionalData: []
  };

  // Check for missed data (lines in pre-existing but not in uploaded)
  preLines.forEach((line, index) => {
    if (!uploadedLines.includes(line)) {
      suggestions.missedData.push(`Missed Data on line ${index + 1}: "${line}"`);
    }
  });

  // Check for additional data (lines in uploaded but not in pre-existing)
  uploadedLines.forEach((line, index) => {
    if (!preLines.includes(line)) {
      suggestions.additionalData.push(`Additional Data on line ${index + 1}: "${line}"`);
    }
  });

  return suggestions;
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
