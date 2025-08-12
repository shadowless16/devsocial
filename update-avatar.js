// Run this in your browser console while logged in to update your avatar
fetch('/api/users/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    avatar: 'https://models.readyplayer.me/689b500ebf8e07103a799ce2.glb'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Avatar updated:', data);
  // Refresh the page to see the new avatar
  window.location.reload();
})
.catch(error => {
  console.error('Error updating avatar:', error);
});