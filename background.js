
// Background script for Devonn.AI Chrome Extension

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Devonn.AI Assistant has been installed');
  
  // Set default settings
  chrome.storage.local.get(['apiUrl', 'userId'], (result) => {
    if (!result.apiUrl) {
      chrome.storage.local.set({
        apiUrl: 'http://localhost:8000',
        userId: 'extension-user',
        notifications: {
          taskComplete: true,
          errors: true
        },
        lastCheck: Date.now()
      });
    }
  });
  
  // Create alarm for periodic health checks
  chrome.alarms.create('healthCheck', { periodInMinutes: 5 });
  
  // Create alarm for agent updates check
  chrome.alarms.create('agentUpdates', { periodInMinutes: 15 });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'runTask') {
    runAgentTask(request.agentId, request.task)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => {
        console.error('Error running task:', error);
        sendResponse({ 
          success: false, 
          error: error.message || 'An unknown error occurred' 
        });
      });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'checkConnection') {
    checkApiConnection()
      .then(isConnected => sendResponse({ connected: isConnected }))
      .catch(error => sendResponse({ connected: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'healthCheck') {
    checkApiConnection()
      .then(isConnected => {
        // Update connection status in storage for popup to access
        chrome.storage.local.set({ connectionStatus: isConnected });
        
        // If connection was restored after being down, show notification
        chrome.storage.local.get(['wasDisconnected'], (result) => {
          if (result.wasDisconnected && isConnected) {
            showNotification('Connection Restored', 'Connection to Devonn.AI API has been restored');
            chrome.storage.local.set({ wasDisconnected: false });
          } else if (!isConnected && !result.wasDisconnected) {
            chrome.storage.local.set({ wasDisconnected: true });
            showNotification('Connection Lost', 'Connection to Devonn.AI API has been lost');
          }
        });
      })
      .catch(console.error);
  }
  
  if (alarm.name === 'agentUpdates') {
    checkForAgentUpdates().catch(console.error);
  }
});

// Run a task using an agent
async function runAgentTask(agentId, task) {
  try {
    const settings = await chrome.storage.local.get(['apiUrl', 'userId']);
    const apiUrl = settings.apiUrl || 'http://localhost:8000';
    
    // Add userId to task if not provided
    if (!task.user_id) {
      task.user_id = settings.userId || 'extension-user';
    }
    
    // Add timeout to fetch to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${apiUrl}/agents/run/${agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    // Show notification based on user preferences
    chrome.storage.local.get(['notifications'], (settings) => {
      const notificationSettings = settings.notifications || { taskComplete: true, errors: true };
      
      if (notificationSettings.taskComplete) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Task Completed',
          message: `Agent ${agentId} completed the task`
        });
      }
    });
    
    return result;
  } catch (error) {
    // Show error notification based on user preferences
    chrome.storage.local.get(['notifications'], (settings) => {
      const notificationSettings = settings.notifications || { taskComplete: true, errors: true };
      
      if (notificationSettings.errors) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Task Error',
          message: error.message || 'An unknown error occurred'
        });
      }
    });
    
    throw error;
  }
}

// Check for agent updates
async function checkForAgentUpdates() {
  try {
    const settings = await chrome.storage.local.get(['apiUrl', 'lastCheck']);
    const apiUrl = settings.apiUrl || 'http://localhost:8000';
    const lastCheck = settings.lastCheck || 0;
    const now = Date.now();
    
    // Only check if sufficient time has passed
    if (now - lastCheck < 15 * 60 * 1000) {
      return;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(
      `${apiUrl}/agents/updates?since=${lastCheck}`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return;
    
    const data = await response.json();
    
    if (data.updates && data.updates.length > 0) {
      // Show notification about updates based on user preferences
      chrome.storage.local.get(['notifications'], (settings) => {
        const notificationSettings = settings.notifications || { taskComplete: true, errors: true };
        
        if (notificationSettings.taskComplete) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Devonn.AI Updates Available',
            message: `${data.updates.length} agent updates available. Open the extension to refresh.`
          });
        }
      });
    }
    
    // Update the last check timestamp regardless of updates
    chrome.storage.local.set({ lastCheck: now });
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

// Check API Connection
async function checkApiConnection() {
  try {
    const settings = await chrome.storage.local.get(['apiUrl']);
    const apiUrl = settings.apiUrl || 'http://localhost:8000';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${apiUrl}/health-check`, { 
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    
    return response.ok;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
}

// Show notification with respect to user preferences
function showNotification(title, message) {
  chrome.storage.local.get(['notifications'], (result) => {
    const notificationSettings = result.notifications || { taskComplete: true, errors: true };
    
    if ((title.includes('Error') && notificationSettings.errors) || 
        (!title.includes('Error') && notificationSettings.taskComplete)) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: title,
        message: message
      });
    }
  });
}
