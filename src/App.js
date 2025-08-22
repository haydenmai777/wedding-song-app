import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Heart, 
  Users, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle,
  Star,
  Play,
  Pause,
  Sparkles,
  User,
  Camera,
  AlertCircle
} from 'lucide-react';
import './App.css';

function App() {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    songTitle: '',
    artist: '',
    requesterName: '',
    occasion: 'anytime',
    priority: 'normal'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOccasion, setFilterOccasion] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load current user from localStorage
    try {
      const savedUser = JSON.parse(localStorage.getItem('currentUser'));
      if (savedUser) {
        setCurrentUser(savedUser);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('currentUser');
    }

    const savedRequests = JSON.parse(localStorage.getItem('songRequests')) || [];
    if (savedRequests.length === 0) {
      // Add sample data with Vietnamese wedding theme
      const sampleRequests = [
        {
          id: 1,
          songTitle: "Perfect",
          artist: "Ed Sheeran",
          requesterName: "Sarah & Mike",
          occasion: "slow",
          priority: "high",
          timestamp: new Date().toLocaleString(),
          likes: 12,
          status: 'pending'
        },
        {
          id: 2,
          songTitle: "Uptown Funk",
          artist: "Bruno Mars",
          requesterName: "Wedding Party",
          occasion: "dancing",
          priority: "normal",
          timestamp: new Date().toLocaleString(),
          likes: 8,
          status: 'pending'
        },
        {
          id: 3,
          songTitle: "All of Me",
          artist: "John Legend",
          requesterName: "Bride & Groom",
          occasion: "slow",
          priority: "high",
          timestamp: new Date().toLocaleString(),
          likes: 15,
          status: 'completed'
        }
      ];
      setRequests(sampleRequests);
      localStorage.setItem('songRequests', JSON.stringify(sampleRequests));
    } else {
      setRequests(savedRequests);
    }
  }, []);

  // Function to compress image
  const compressImage = (file, maxWidth = 150, maxHeight = 150, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          try {
            // Calculate new dimensions
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            
            console.log('Image compressed:', { originalSize: file.size, compressedSize: compressedDataUrl.length });
            resolve(compressedDataUrl);
          } catch (drawError) {
            console.error('Error drawing image to canvas:', drawError);
            reject(drawError);
          }
        };
        
        img.onerror = (error) => {
          console.error('Error loading image:', error);
          reject(new Error('Failed to load image'));
        };
        
        img.src = URL.createObjectURL(file);
      } catch (error) {
        console.error('Error in compressImage:', error);
        reject(error);
      }
    });
  };

  // Fallback method for simple image handling
  const handleImageSimple = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userName = formData.get('userName');
    const profilePicture = formData.get('profilePicture');

    console.log('Profile update started:', { userName, hasPicture: !!profilePicture, fileSize: profilePicture?.size });

    try {
      let compressedImage = null;
      
      if (profilePicture && profilePicture.size > 0) {
        console.log('Processing profile picture...');
        
        // Check file size (max 5MB)
        if (profilePicture.size > 5 * 1024 * 1024) {
          setErrorMessage('Profile picture must be smaller than 5MB');
          setShowError(true);
          setTimeout(() => setShowError(false), 3000);
          return;
        }
        
        try {
          // Compress the image
          compressedImage = await compressImage(profilePicture);
          console.log('Image compressed successfully, size:', compressedImage.length);
        } catch (compressError) {
          console.error('Image compression failed:', compressError);
          console.log('Trying fallback method...');
          
          try {
            // Try simple method as fallback
            compressedImage = await handleImageSimple(profilePicture);
            console.log('Fallback method successful, size:', compressedImage.length);
          } catch (fallbackError) {
            console.error('Fallback method also failed:', fallbackError);
            // Continue without profile picture if both methods fail
            compressedImage = null;
          }
        }
      }

      const userProfile = {
        name: userName,
        profilePicture: compressedImage,
        joinedAt: new Date().toLocaleString()
      };

      console.log('Saving user profile...');

      // Try to save to localStorage
      try {
        localStorage.setItem('currentUser', JSON.stringify(userProfile));
        console.log('Profile saved successfully');
        
        setCurrentUser(userProfile);
        setShowProfileModal(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (storageError) {
        console.error('Storage error:', storageError);
        
        if (storageError.name === 'QuotaExceededError') {
          console.log('Quota exceeded, trying without profile picture...');
          
          // If still too large, try without profile picture
          const userProfileWithoutPic = {
            name: userName,
            profilePicture: null,
            joinedAt: new Date().toLocaleString()
          };
          
          try {
            localStorage.setItem('currentUser', JSON.stringify(userProfileWithoutPic));
            console.log('Profile saved without picture');
            
            setCurrentUser(userProfileWithoutPic);
            setShowProfileModal(false);
            setErrorMessage('Profile picture was too large and was removed. Profile updated without picture.');
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
          } catch (finalError) {
            console.error('Final storage error:', finalError);
            setErrorMessage('Unable to save profile. Please try again.');
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
          }
        } else {
          throw storageError;
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Error updating profile. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      id: Date.now(),
      ...formData,
      requesterName: currentUser ? currentUser.name : formData.requesterName,
      timestamp: new Date().toLocaleString(),
      likes: 0,
      status: 'pending'
    };
    
    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem('songRequests', JSON.stringify(updatedRequests));
    
    setFormData({
      songTitle: '',
      artist: '',
      requesterName: '',
      occasion: 'anytime',
      priority: 'normal'
    });
    
    setShowForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLike = (id) => {
    const updatedRequests = requests.map(req =>
      req.id === id ? { ...req, likes: req.likes + 1 } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('songRequests', JSON.stringify(updatedRequests));
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedRequests = requests.map(req =>
      req.id === id ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('songRequests', JSON.stringify(updatedRequests));
  };

  const deleteRequest = (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      const updatedRequests = requests.filter(req => req.id !== id);
      setRequests(updatedRequests);
      localStorage.setItem('songRequests', JSON.stringify(updatedRequests));
    }
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all requests?')) {
      setRequests([]);
      localStorage.removeItem('songRequests');
    }
  };

  const filteredRequests = requests
    .filter(req => 
      req.songTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requesterName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(req => filterOccasion === 'all' || req.occasion === filterOccasion)
    .sort((a, b) => {
      if (sortBy === 'timestamp') return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#E74C3C';
      case 'normal': return '#3498DB';
      case 'low': return '#27AE60';
      default: return '#95A5A6';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#27AE60';
      case 'playing': return '#F39C12';
      case 'pending': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  const getOccasionText = (occasion) => {
    const occasions = {
      'anytime': 'Anytime',
      'dinner': 'During Dinner',
      'dancing': 'Dance Time',
      'slow': 'Slow Dance',
      'party': 'Party Time'
    };
    return occasions[occasion] || 'Anytime';
  };

  return (
    <div className="app">
      <motion.div 
        className="header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="header-content">
          <motion.div 
            className="logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Music className="logo-icon" />
            <h1>Wedding Song Requests</h1>
          </motion.div>
          <motion.p 
            className="subtitle"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Create magical moments through music
          </motion.p>
          <motion.div
            className="festive-banner"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
          >
            <Sparkles size={20} />
            <span>🎊 Chúc mừng đám cưới • Wedding Celebration 🎊</span>
            <Sparkles size={20} />
          </motion.div>
        </div>
      </motion.div>

      <div className="main-content">
        {/* User Profile Section */}
        <motion.div 
          className="user-profile-section"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          {currentUser ? (
            <div className="user-profile">
              <div className="profile-info">
                {currentUser.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture} 
                    alt={currentUser.name} 
                    className="profile-picture"
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    <User size={24} />
                  </div>
                )}
                <div className="profile-details">
                  <h3>Welcome, {currentUser.name}! 🎉</h3>
                  <p>Joined: {currentUser.joinedAt}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="edit-profile-btn"
              >
                <User size={16} />
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="join-prompt">
              <h3>Join the Celebration! 🎊</h3>
              <p>Add your name and profile picture to get started</p>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="join-btn"
              >
                <User size={16} />
                Join Now
              </button>
            </div>
          )}
        </motion.div>

        <div className="controls">
          <motion.button
            className="add-button"
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            disabled={!currentUser}
          >
            <Plus size={20} />
            {showForm ? 'Cancel' : 'Request Song'}
          </motion.button>

          <motion.div 
            className="filters"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <input
              type="text"
              placeholder="Search songs, artists, or names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select
              value={filterOccasion}
              onChange={(e) => setFilterOccasion(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Occasions</option>
              <option value="anytime">Anytime</option>
              <option value="dinner">During Dinner</option>
              <option value="dancing">Dance Time</option>
              <option value="slow">Slow Dance</option>
              <option value="party">Party Time</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="timestamp">Latest First</option>
              <option value="likes">Most Liked</option>
              <option value="priority">Priority</option>
            </select>
          </motion.div>
        </div>

        {/* Profile Modal */}
        <AnimatePresence>
          {showProfileModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
            >
              <motion.div
                className="profile-modal"
                initial={{ scale: 0.8, opacity: 0, y: -50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -50 }}
                transition={{ duration: 0.3, type: "spring" }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>🎊 Join the Wedding Celebration 🎊</h3>
                <form onSubmit={handleProfileSubmit} className="profile-form">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      name="userName"
                      required
                      placeholder="Enter your name"
                      defaultValue={currentUser?.name || ''}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Profile Picture</label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        name="profilePicture"
                        accept="image/*"
                        className="file-input"
                        id="profile-picture"
                      />
                      <label htmlFor="profile-picture" className="file-input-label">
                        <Camera size={16} />
                        Choose Photo
                      </label>
                    </div>
                    <small>Optional - Max 5MB. Image will be automatically compressed.</small>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      {currentUser ? 'Update Profile' : 'Join Celebration'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="success-message"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <CheckCircle size={20} />
              {currentUser ? 'Profile updated successfully!' : 'Song request submitted successfully!'}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showError && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <AlertCircle size={20} />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showForm && (
            <motion.div
              className="form-overlay"
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <form onSubmit={handleSubmit} className="song-form">
                <h3>🎵 New Song Request 🎵</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Song Title *</label>
                    <input
                      type="text"
                      value={formData.songTitle}
                      onChange={(e) => setFormData({...formData, songTitle: e.target.value})}
                      required
                      placeholder="Enter song name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Artist *</label>
                    <input
                      type="text"
                      value={formData.artist}
                      onChange={(e) => setFormData({...formData, artist: e.target.value})}
                      required
                      placeholder="Enter artist name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>When to Play</label>
                    <select
                      value={formData.occasion}
                      onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                    >
                      <option value="anytime">Anytime</option>
                      <option value="dinner">During Dinner</option>
                      <option value="dancing">Dance Time</option>
                      <option value="slow">Slow Dance</option>
                      <option value="party">Party Time</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    🎉 Submit Request 🎉
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="requests-container">
          <div className="requests-header">
            <h3>🎶 Song Requests ({filteredRequests.length})</h3>
            {requests.length > 0 && (
              <button onClick={clearAll} className="clear-btn">
                <Trash2 size={16} />
                Clear All
              </button>
            )}
          </div>

          <AnimatePresence>
            {filteredRequests.length === 0 ? (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                <Music size={48} />
                <p>No song requests found</p>
                <small>Try adjusting your search or filters</small>
              </motion.div>
            ) : (
              <div className="requests-grid">
                {filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    className="request-card"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <div className="card-header">
                      <div className="song-info">
                        <h4>{request.songTitle}</h4>
                        <p className="artist">{request.artist}</p>
                      </div>
                      <div className="priority-badge" style={{ backgroundColor: getPriorityColor(request.priority) }}>
                        {request.priority === 'high' ? 'High' : 
                         request.priority === 'normal' ? 'Normal' : 'Low'}
                      </div>
                    </div>

                    <div className="card-details">
                      <div className="detail-item">
                        <Users size={16} />
                        <span>{request.requesterName || 'Anonymous'}</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>{request.timestamp}</span>
                      </div>
                      <div className="detail-item">
                        <Star size={16} />
                        <span>{getOccasionText(request.occasion)}</span>
                      </div>
                    </div>

                    <div className="card-actions">
                      <div className="status-controls">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusChange(request.id, e.target.value)}
                          className="status-select"
                          style={{ borderColor: getStatusColor(request.status) }}
                        >
                          <option value="pending">Pending</option>
                          <option value="playing">Playing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div className="action-buttons">
                        <button
                          onClick={() => handleLike(request.id)}
                          className="like-btn"
                          title="Like this request"
                        >
                          <Heart size={16} />
                          <span>{request.likes}</span>
                        </button>

                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="delete-btn"
                          title="Delete request"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
