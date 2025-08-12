// Quick script to assign analytics role to a user
// Run this in the browser console while logged in

async function assignAnalyticsRole() {
  try {
    // First, get current user info
    const userResponse = await fetch('/api/users/profile')
    const userData = await userResponse.json()
    
    console.log('Current user:', userData)
    
    if (!userData.user) {
      console.error('No user found. Please make sure you are logged in.')
      return
    }
    
    // Check if user is already admin (can assign roles)
    if (userData.user.role === 'admin') {
      console.log('User is already admin - can access analytics')
      return
    }
    
    // For development, we'll directly update the database
    // In production, only admins should be able to do this
    console.log('To assign analytics role, run this in your database:')
    console.log(`db.users.updateOne({_id: ObjectId("${userData.user._id}")}, {$set: {role: "analytics"}})`)
    
    // Or if you're an admin, uncomment this:
    /*
    const roleResponse = await fetch('/api/admin/assign-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userData.user._id,
        role: 'analytics'
      })
    })
    
    const roleResult = await roleResponse.json()
    console.log('Role assignment result:', roleResult)
    */
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the function
assignAnalyticsRole()