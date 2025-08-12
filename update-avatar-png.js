// Run this in your browser console to update with PNG version
fetch('/api/users/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    avatar: 'https://models.readyplayer.me/689b500ebf8e07103a799ce2.png'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Avatar updated with PNG:', data);
  window.location.reload();
})
.catch(error => {
  console.error('Error updating avatar:', error);
});