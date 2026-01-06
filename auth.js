// Authentication functions
class AuthManager {
  constructor() {
    this.users = JSON.parse(localStorage.getItem("users")) || [];
    this.currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  }

  // Register new user
  register(email, password, name, role) {
    if (this.users.find(u => u.email === email)) {
      return { success: false, message: "Email already registered" };
    }

    const newUser = {
      id: Date.now(),
      email,
      password, // Note: In production, never store plain passwords
      name,
      role, // 'student' or 'organizer'
      registeredEvents: [],
      createdEvents: [],
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    localStorage.setItem("users", JSON.stringify(this.users));
    return { success: true, message: "Registration successful", user: newUser };
  }

  // Login user
  login(email, password, role) {
    const user = this.users.find(u => u.email === email && u.role === role);
    
    if (!user) {
      return { success: false, message: "Invalid credentials" };
    }

    if (user.password !== password) {
      return { success: false, message: "Invalid password" };
    }

    this.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userId", user.id);

    return { success: true, message: "Login successful", user };
  }

  // Quick login (used from homepage)
  quickLogin(email, role) {
    let user = this.users.find(u => u.email === email && u.role === role);
    
    if (!user) {
      // Auto-create user if doesn't exist
      user = {
        id: Date.now(),
        email,
        name: email.split('@')[0],
        role,
        registeredEvents: [],
        createdEvents: [],
        createdAt: new Date().toISOString()
      };
      this.users.push(user);
      localStorage.setItem("users", JSON.stringify(this.users));
    }

    this.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userId", user.id);

    return { success: true, user };
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser || JSON.parse(localStorage.getItem("currentUser"));
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  // Update user profile
  updateProfile(userId, updates) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      localStorage.setItem("users", JSON.stringify(this.users));
      
      if (this.currentUser.id === userId) {
        this.currentUser = this.users[userIndex];
        localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
      }
      return true;
    }
    return false;
  }

  // Register user for event
  registerForEvent(userId, eventId) {
    const user = this.users.find(u => u.id === userId);
    if (user && !user.registeredEvents.includes(eventId)) {
      user.registeredEvents.push(eventId);
      localStorage.setItem("users", JSON.stringify(this.users));
      return true;
    }
    return false;
  }

  // Get user's registered events
  getUserRegisteredEvents(userId) {
    const user = this.users.find(u => u.id === userId);
    return user ? user.registeredEvents : [];
  }
}

// Initialize auth manager
const auth = new AuthManager();

// ===== PUBLIC NAVIGATION FUNCTIONS =====

// Navigate to login (from homepage)
function goToLogin() {
  const email = prompt("Enter your college email:");
  if (email) {
    const isOrganizer = confirm("Are you an Organizer?\n\nOK = Organizer\nCancel = Student");
    const role = isOrganizer ? "organizer" : "student";
    
    const result = auth.quickLogin(email, role);
    if (result.success) {
      window.location.href = "dashboard.html";
    }
  }
}

// Navigate to create event (from homepage)
function goToCreateEvent() {
  const email = prompt("Enter your college email (organizers only):");
  if (email) {
    const result = auth.quickLogin(email, "organizer");
    if (result.success) {
      window.location.href = "create-event.html";
    }
  }
}

// Browse district and login
function browseDistrict(district) {
  const email = prompt("Enter your college email to explore " + district + ":");
  if (email) {
    const isOrganizer = confirm("Are you an Organizer?\n\nOK = Organizer\nCancel = Student");
    const role = isOrganizer ? "organizer" : "student";
    
    const result = auth.quickLogin(email, role);
    if (result.success) {
      localStorage.setItem("selectedDistrict", district);
      window.location.href = "dashboard.html";
    }
  }
}

// Logout user
function logout() {
  auth.logout();
  window.location.href = "index.html";
}

// ===== LEGACY FUNCTIONS FOR COMPATIBILITY =====

// Login from dashboard or other pages
function login() {
  const emailInput = document.getElementById("email");
  const roleSelect = document.getElementById("role");
  
  if (emailInput && roleSelect) {
    const email = emailInput.value.trim();
    const role = roleSelect.value;
    
    if (!email) {
      alert("Please enter your email");
      return;
    }

    const result = auth.quickLogin(email, role);
    if (result.success) {
      window.location.href = "dashboard.html";
    } else {
      alert(result.message);
    }
  }
}

// Register for event
function register() {
  const currentUser = auth.getCurrentUser();
  if (!currentUser) {
    alert("Please login first");
    window.location.href = "index.html";
    return;
  }

  const eventId = parseInt(localStorage.getItem("eventId"));
  if (eventId && events) {
    const event = events.find(e => e.id === eventId);
    if (event) {
      auth.registerForEvent(currentUser.id, eventId);
      alert("🎉 Successfully registered for " + event.title + "!");
    }
  }
}

// Go back to previous page
function goBack() {
  window.history.back();
}

// ===== PAGE INITIALIZATION =====

// Check authentication on page load
function checkAuth() {
  const currentUser = auth.getCurrentUser();
  const currentPath = window.location.pathname.split('/').pop();
  const publicPages = ['index.html', 'index.htm', ''];
  
  // Allow access to public pages without auth
  if (publicPages.includes(currentPath)) {
    return;
  }

  // For protected pages, you can optionally redirect to login
  // if (!currentUser) {
  //   window.location.href = "index.html";
  // }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", checkAuth);
} else {
  checkAuth();
}
