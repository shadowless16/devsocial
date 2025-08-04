// Test file to verify UploadThing configuration
// Run this in the browser console to check if the client is properly configured

console.log("Testing UploadThing configuration...");

// Check if the upload endpoints are accessible
fetch("/api/uploadthing", { method: "GET" })
  .then(response => {
    console.log("API Route Status:", response.status);
    return response.text();
  })
  .then(text => {
    console.log("API Route Response:", text);
  })
  .catch(error => {
    console.error("API Route Error:", error);
  });

// Instructions:
// 1. Make sure your Next.js dev server is running
// 2. Open the browser developer console
// 3. Navigate to your upload page
// 4. Copy and paste this code into the console
// 5. Check the console output

// If you see a 404 error, the API route is not properly configured
// If you see a 405 or other error, the route exists but may have other issues
