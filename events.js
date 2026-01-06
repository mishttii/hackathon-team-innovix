// Load events from localStorage if they exist, otherwise use default data
function loadEvents() {
  if (localStorage.getItem("events")) {
    return JSON.parse(localStorage.getItem("events"));
  }
  return events; // fallback to data.js
}

// Initialize events
let allEvents = loadEvents();

// Update global events variable for compatibility
if (typeof events === 'undefined') {
  var events = allEvents;
}

// View event details
function viewEvent(id) {
  localStorage.setItem("eventId", id);
  window.location.href = "event.html";
}

// Create new event
function createEvent(eventData) {
  const newEvent = {
    id: (Math.max(...events.map(e => e.id || 0)) + 1),
    ...eventData,
    attendees: 1
  };
  
  events.push(newEvent);
  localStorage.setItem("events", JSON.stringify(events));
  return newEvent;
}

// Update event
function updateEvent(id, updatedData) {
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedData };
    localStorage.setItem("events", JSON.stringify(events));
    return events[index];
  }
  return null;
}

// Delete event
function deleteEvent(id) {
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events.splice(index, 1);
    localStorage.setItem("events", JSON.stringify(events));
    return true;
  }
  return false;
}

// Get event by ID
function getEventById(id) {
  return events.find(e => e.id == id);
}

// Filter events by category
function filterByCategory(category) {
  return events.filter(e => e.category === category);
}

// Filter events by district
function filterByDistrict(district) {
  return events.filter(e => e.district === district);
}

// Search events
function searchEvents(query) {
  const lowerQuery = query.toLowerCase();
  return events.filter(e => 
    e.title.toLowerCase().includes(lowerQuery) ||
    e.description.toLowerCase().includes(lowerQuery) ||
    e.venue.toLowerCase().includes(lowerQuery)
  );
}

// Get upcoming events (next 7 days)
function getUpcomingEvents() {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate >= today && eventDate <= nextWeek;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Get popular events (by attendee count)
function getPopularEvents() {
  return events
    .sort((a, b) => (b.attendees || 0) - (a.attendees || 0))
    .slice(0, 10);
}

// Register user for event
function registerForEvent(eventId, userId) {
  const event = getEventById(eventId);
  if (event) {
    if (!event.registeredUsers) {
      event.registeredUsers = [];
    }
    if (!event.registeredUsers.includes(userId)) {
      event.registeredUsers.push(userId);
      event.attendees = (event.attendees || 0) + 1;
      localStorage.setItem("events", JSON.stringify(events));
      return true;
    }
  }
  return false;
}

// Get user registered events
function getUserRegisteredEvents(userId) {
  return events.filter(e => 
    e.registeredUsers && e.registeredUsers.includes(userId)
  );
}

// Get statistics
function getEventStatistics() {
  return {
    totalEvents: events.length,
    totalCategories: new Set(events.map(e => e.category)).size,
    totalDistricts: new Set(events.map(e => e.district)).size,
    totalCapacity: events.reduce((sum, e) => sum + (e.capacity || 0), 0),
    totalAttendees: events.reduce((sum, e) => sum + (e.attendees || 0), 0)
  };
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time for display
function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
